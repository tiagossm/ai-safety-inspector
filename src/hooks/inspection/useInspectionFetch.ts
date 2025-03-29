import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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

      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select(`
          *,
          companies:company_id(id, fantasy_name, address, cnae),
          checklist:checklist_id(id, title, description)
        `)
        .eq("id", inspectionId)
        .single();

      if (inspectionError) throw inspectionError;
      if (!inspectionData) throw new Error("Inspeção não encontrada");

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
          .select("*")
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

      const questionsArray = checklistItems.map((item: any) => ({
        id: item.id,
        text: item.pergunta,
        responseType: item.tipo_resposta,
        groupId: null,
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
      }));

      const groupsMap = new Map();
      const DEFAULT_GROUP = {
        id: 'default-group',
        title: 'Geral',
        order: 0
      };

      checklistItems.forEach((item: any) => {
        if (item.hint) {
          try {
            let hintData = item.hint;
            if (typeof item.hint === 'string') {
              try {
                hintData = JSON.parse(item.hint);
              } catch (e) {}
            }
            if (hintData && hintData.groupId && hintData.groupTitle) {
              if (!groupsMap.has(hintData.groupId)) {
                groupsMap.set(hintData.groupId, {
                  id: hintData.groupId,
                  title: hintData.groupTitle,
                  order: hintData.groupIndex || 0,
                });
              }
            }
          } catch (e) {
            console.warn(`Erro ao processar hint do item ${item.id}:`, e);
          }
        }
      });

      if (groupsMap.size === 0) {
        groupsMap.set(DEFAULT_GROUP.id, DEFAULT_GROUP);
      }

      checklistItems.forEach((item: any, index: number) => {
        const questionToUpdate = questionsArray[index];
        if (!questionToUpdate) return;

        if (item.hint) {
          try {
            let hintData = item.hint;
            if (typeof item.hint === 'string') {
              try {
                hintData = JSON.parse(item.hint);
              } catch (e) {}
            }
            if (hintData && hintData.groupId && groupsMap.has(hintData.groupId)) {
              questionToUpdate.groupId = hintData.groupId;
            }
          } catch (e) {}
        }

        if (questionToUpdate.groupId === null) {
          questionToUpdate.groupId = DEFAULT_GROUP.id;
        }
      });

      const extractedGroups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);

      // 🛠️ GARANTIR QUE TODAS AS PERGUNTAS TENHAM GROUP ID VÁLIDO
      const fallbackGroupId = extractedGroups[0]?.id || DEFAULT_GROUP.id;
      const questionsWithValidGroups = questionsArray.map((q) => ({
        ...q,
        groupId: q.groupId || fallbackGroupId,
      }));

      setGroups(extractedGroups);
      setQuestions(questionsWithValidGroups);

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

      const subChecklistIds = questionsWithValidGroups
        .filter(q => q.subChecklistId)
        .map(q => ({ questionId: q.id, subChecklistId: q.subChecklistId }));

      if (subChecklistIds.length > 0) {
        const subChecklistsData: Record<string, any> = {};
        await Promise.all(
          subChecklistIds.map(async ({ questionId, subChecklistId }) => {
            try {
              const { data: checklistData } = await supabase
                .from("checklists")
                .select("*")
                .eq("id", subChecklistId)
                .single();

              const { data: subQuestions } = await supabase
                .from("checklist_itens")
                .select("*")
                .eq("checklist_id", subChecklistId)
                .order("ordem", { ascending: true });

              if (checklistData && subQuestions) {
                subChecklistsData[questionId] = {
                  ...checklistData,
                  questions: subQuestions.map((q: any) => ({
                    id: q.id,
                    text: q.pergunta,
                    responseType: q.tipo_resposta,
                    groupId: q.group_id,
                    options: q.opcoes,
                    isRequired: q.obrigatorio,
                    order: q.ordem,
                  })),
                };
              }
            } catch (error) {
              console.error(`Erro ao buscar sub-checklist ${subChecklistId}`, error);
            }
          })
        );

        setSubChecklists(subChecklistsData);
      }
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
    refreshData: fetchInspectionData
  };
}
