import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useInspectionFetch(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  const normalizeResponseType = (tipo: string): string => {
    switch (tipo?.toLowerCase()) {
      case "sim/não":
      case "sim/nao":
      case "yes_no":
        return "yes_no";
      case "texto":
      case "text":
        return "text";
      case "número":
      case "number":
        return "number";
      case "múltipla escolha":
      case "multiple_choice":
        return "multiple_choice";
      default:
        return tipo || "text";
    }
  };

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

      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select(`*, companies:company_id(id, fantasy_name), checklist:checklist_id(id, title, description, category)`)
        .eq("id", inspectionId)
        .single();

      if (inspectionError || !inspectionData) {
        throw inspectionError || new Error("Inspeção não encontrada");
      }

      const isSubChecklist = inspectionData.checklist?.category === "subchecklist";
      if (isSubChecklist) {
        setError("Esta inspeção é um sub-checklist e não pode ser executada diretamente.");
        setLoading(false);
        return;
      }

      setInspection({
        id: inspectionData.id,
        title: inspectionData.checklist?.title,
        description: inspectionData.checklist?.description,
        checklistId: inspectionData.checklist_id,
        companyId: inspectionData.company_id,
        responsibleId: inspectionData.responsible_id,
        scheduledDate: inspectionData.scheduled_date,
        locationName: inspectionData.location,
        status: inspectionData.status || "pending",
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

      const { data: checklistItems, error: checklistError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", inspectionData.checklist_id)
        .order("ordem", { ascending: true });

      if (checklistError) throw checklistError;

      const DEFAULT_GROUP = { id: "default-group", title: "Geral", order: 0 };
      const groupsMap = new Map<string, any>();
      groupsMap.set(DEFAULT_GROUP.id, DEFAULT_GROUP);

      const parsedQuestions = checklistItems.map((item: any) => {
        let groupId = DEFAULT_GROUP.id;

        try {
          const hint = typeof item.hint === "string" ? JSON.parse(item.hint) : item.hint;
          if (hint?.groupId && hint?.groupTitle) {
            groupId = hint.groupId;
            if (!groupsMap.has(groupId)) {
              groupsMap.set(groupId, {
                id: groupId,
                title: hint.groupTitle,
                order: hint.groupIndex || 0,
              });
            }
          }
        } catch {}

        return {
          id: item.id,
          text: item.pergunta,
          responseType: normalizeResponseType(item.tipo_resposta),
          options: item.opcoes,
          isRequired: item.obrigatorio,
          order: item.ordem,
          groupId,
          parentQuestionId: item.parent_item_id || null,
          parentValue: item.condition_value || null,
          hint: item.hint || null,
          subChecklistId: item.sub_checklist_id,
          hasSubChecklist: !!item.sub_checklist_id,
          allowsPhoto: item.permite_foto || false,
          allowsVideo: item.permite_video || false,
          allowsAudio: item.permite_audio || false,
          allowsFiles: item.permite_files || false,
          weight: item.weight || 1,
        };
      });

      const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
      setGroups(sortedGroups.length > 0 ? sortedGroups : [DEFAULT_GROUP]);
      setQuestions(parsedQuestions);

      const { data: responsesData } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      const responsesObj = (responsesData || []).reduce((acc: Record<string, any>, r) => {
        acc[r.question_id] = {
          value: r.answer,
          comment: r.notes,
          actionPlan: r.action_plan,
          mediaUrls: r.media_urls || [],
          subChecklistResponses: r.sub_checklist_responses || {},
        };
        return acc;
      }, {});
      setResponses(responsesObj);

      const questionsWithSubchecklist = parsedQuestions.filter(q => q.subChecklistId);
      const subChecklistsMap: Record<string, any> = {};

      if (questionsWithSubchecklist.length > 0) {
        for (const question of questionsWithSubchecklist) {
          try {
            const { data: checklistData, error: checklistError } = await supabase
              .from("checklists")
              .select("*")
              .eq("id", question.subChecklistId)
              .single();

            if (checklistError) continue;

            const { data: subQuestions, error: questionsError } = await supabase
              .from("checklist_itens")
              .select("*")
              .eq("checklist_id", question.subChecklistId)
              .order("ordem", { ascending: true });

            if (questionsError || !subQuestions?.length) continue;

            const processedSubQuestions = subQuestions.map((item: any) => ({
              id: item.id,
              text: item.pergunta,
              responseType: normalizeResponseType(item.tipo_resposta),
              options: item.opcoes,
              isRequired: item.obrigatorio,
              order: item.ordem,
              parentQuestionId: item.parent_item_id || null,
              parentValue: item.condition_value || null,
              hint: item.hint || null,
              allowsPhoto: item.permite_foto || false,
              allowsVideo: item.permite_video || false,
              allowsAudio: item.permite_audio || false,
              allowsFiles: item.permite_files || false,
              weight: item.weight || 1,
            }));

            subChecklistsMap[question.id] = {
              id: checklistData.id,
              title: checklistData.title,
              description: checklistData.description,
              questions: processedSubQuestions,
            };
          } catch (err) {
            console.error(`Erro ao carregar sub-checklist da pergunta ${question.id}:`, err);
          }
        }
      }

      setSubChecklists(subChecklistsMap);
    } catch (err: any) {
      console.error("Erro ao buscar dados da inspeção:", err);
      setError(err.message || "Erro ao carregar inspeção");
      setDetailedError(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    if (inspectionId) {
      fetchInspectionData();
    } else {
      setLoading(false);
      setGroups([]);
      setQuestions([]);
      setResponses({});
      setSubChecklists({});
    }
  }, [fetchInspectionData, inspectionId]);

  return {
    loading,
    error,
    detailedError,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    subChecklists,
    setResponses,
    refreshData: fetchInspectionData,
  };
}
