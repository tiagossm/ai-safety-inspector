// ✅ useInspectionFetch.ts

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useInspectionFetch(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  const fetchInspectionData = useCallback(async () => {
    if (!inspectionId) {
      setError("ID da inspeção não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDetailedError(null);

      // 🔹 Buscar dados principais da inspeção
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select(`
          *,
          companies:company_id(id, fantasy_name, address, cnae),
          checklist:checklist_id(id, title, description, category)
        `)
        .eq("id", inspectionId)
        .single();

      if (inspectionError || !inspectionData) {
        throw inspectionError || new Error("Inspeção não encontrada");
      }

      const isSubChecklist = inspectionData.checklist?.category === "sub-checklist";
      if (isSubChecklist) {
        console.warn("❌ Esta inspeção aponta para um sub-checklist. Ignorando carregamento.");
        setError("Esta inspeção é um sub-checklist e não pode ser executada diretamente.");
        setLoading(false);
        return;
      }

      setInspection({
        id: inspectionData.id,
        title: inspectionData.checklist?.title || "Sem título",
        description: inspectionData.checklist?.description || "",
        checklistId: inspectionData.checklist_id,
        status: inspectionData.status || "pending",
        companyId: inspectionData.company_id,
        responsibleId: inspectionData.responsible_id,
        scheduledDate: inspectionData.scheduled_date,
        locationName: inspectionData.location,
      });

      setCompany(inspectionData.companies);

      if (inspectionData.responsible_id) {
        const { data: userData } = await supabase
          .from("users")
          .select("name")
          .eq("id", inspectionData.responsible_id)
          .single();
        if (userData) setResponsible(userData);
      }

      // 🔹 Buscar perguntas do checklist principal
      const { data: checklistItems, error: checklistError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", inspectionData.checklist_id)
        .order("ordem", { ascending: true });

      if (checklistError) throw checklistError;

      const DEFAULT_GROUP = {
        id: "default-group",
        title: "Geral",
        order: 0,
      };
      const groupsMap = new Map<string, any>();
      const processedQuestions = checklistItems.map((item: any) => {
        let groupId = DEFAULT_GROUP.id;

        // Tenta extrair o grupo do campo hint (se houver)
        if (item.hint) {
          try {
            const parsed = typeof item.hint === "string" ? JSON.parse(item.hint) : item.hint;
            if (parsed.groupId && parsed.groupTitle) {
              groupId = parsed.groupId;
              if (!groupsMap.has(groupId)) {
                groupsMap.set(groupId, {
                  id: groupId,
                  title: parsed.groupTitle,
                  order: parsed.groupIndex || 0,
                });
              }
            }
          } catch (e) {
            console.warn("Hint inválido:", item.hint);
          }
        }

        return {
          id: item.id,
          text: item.pergunta,
          responseType: item.tipo_resposta,
          groupId,
          options: item.opcoes,
          isRequired: item.obrigatorio,
          order: item.ordem,
          parentQuestionId: item.parent_item_id || null,
          parentValue: item.condition_value || null,
          hint: item.hint || null,
          subChecklistId: item.sub_checklist_id || null,
          hasSubChecklist: !!item.sub_checklist_id,
          allowsPhoto: item.permite_foto || false,
          allowsVideo: item.permite_video || false,
          allowsAudio: item.permite_audio || false,
          weight: item.weight || 1,
        };
      });

      if (groupsMap.size === 0) {
        groupsMap.set(DEFAULT_GROUP.id, DEFAULT_GROUP);
      }

      setGroups(Array.from(groupsMap.values()).sort((a, b) => a.order - b.order));
      setQuestions(processedQuestions);

      // 🔹 Buscar respostas existentes
      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      if (responsesError) throw responsesError;

      const responsesObj = (responsesData || []).reduce((acc: Record<string, any>, curr: any) => {
        acc[curr.question_id] = {
          value: curr.answer,
          comment: curr.notes,
          actionPlan: curr.action_plan,
          mediaUrls: curr.media_urls || [],
          subChecklistResponses: curr.sub_checklist_responses || {},
        };
        return acc;
      }, {});
      setResponses(responsesObj);

      // 🔹 Buscar perguntas de sub-checklists (apenas se referenciadas)
      const subChecklistRefs = processedQuestions
        .filter((q) => q.subChecklistId)
        .map((q) => ({ questionId: q.id, subChecklistId: q.subChecklistId }));

      const subChecklistsData: Record<string, any> = {};
      for (const { questionId, subChecklistId } of subChecklistRefs) {
        const { data: checklistData } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", subChecklistId)
          .single();

        if (checklistData?.category !== "sub-checklist") continue;

        const { data: subQuestions } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", subChecklistId)
          .order("ordem", { ascending: true });

        subChecklistsData[questionId] = {
          ...checklistData,
          questions: subQuestions,
        };
      }

      setSubChecklists(subChecklistsData);
    } catch (err: any) {
      console.error("Erro ao buscar dados da inspeção:", err);
      setError(err.message || "Erro ao carregar dados da inspeção");
      setDetailedError(err);
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    fetchInspectionData();
  }, [fetchInspectionData]);

  return {
    loading,
    error,
    detailedError,
    inspection,
    questions,
    responses,
    groups,
    company,
    responsible,
    subChecklists,
    setResponses,
    refreshData: fetchInspectionData,
  };
}
