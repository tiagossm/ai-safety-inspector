
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

      // Fetch the inspection details
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select(`
          *,
          companies:company_id(id, fantasy_name),
          checklist:checklist_id(id, title, description, category)
        `)
        .eq("id", inspectionId)
        .single();

      if (inspectionError || !inspectionData) {
        throw inspectionError || new Error("Inspeção não encontrada");
      }

      // Check if this is a sub-checklist inspection - we don't want to execute these directly
      const isSubChecklist = inspectionData.checklist?.category === "sub-checklist";
      if (isSubChecklist) {
        setError("Esta inspeção é um sub-checklist e não pode ser executada diretamente.");
        setLoading(false);
        return;
      }

      // Set basic inspection info
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

      // Set company info
      setCompany(inspectionData.companies);

      // Fetch responsible user info if available
      if (inspectionData.responsible_id) {
        const { data: userData } = await supabase
          .from("users")
          .select("name")
          .eq("id", inspectionData.responsible_id)
          .single();
        if (userData) setResponsible(userData);
      }

      // Fetch checklist items (questions)
      const { data: checklistItems, error: checklistError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", inspectionData.checklist_id)
        .order("ordem", { ascending: true });

      if (checklistError) throw checklistError;

      // Set up a default group in case questions don't have group information
      const DEFAULT_GROUP = {
        id: "default-group",
        title: "Geral",
        order: 0,
      };

      // Extract groups from questions
      const groupsMap = new Map<string, any>();
      groupsMap.set(DEFAULT_GROUP.id, DEFAULT_GROUP);

      // Process questions and extract groups
      const parsedQuestions = checklistItems.map((item: any) => {
        let groupId = DEFAULT_GROUP.id;

        // Try to extract group info from the hint field
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
        } catch {
          // Se erro, mantém grupo default
        }

        return {
          id: item.id,
          text: item.pergunta,
          responseType: item.tipo_resposta,
          options: item.opcoes,
          isRequired: item.obrigatorio,
          order: item.ordem,
          groupId,
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

      // Sort and set groups
      const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
      setGroups(sortedGroups);
      setQuestions(parsedQuestions);

      // Fetch responses for this inspection
      const { data: responsesData } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      // Process responses into a more manageable format
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

      // Fetch sub-checklists for questions that reference them
      const subChecklistRefs = parsedQuestions.filter(q => q.subChecklistId);
      const subChecklistsMap: Record<string, any> = {};

      for (const ref of subChecklistRefs) {
        // Fetch sub-checklist data
        const { data: checklistData } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", ref.subChecklistId)
          .single();

        // Fetch sub-checklist questions
        const { data: subQuestions } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", ref.subChecklistId)
          .order("ordem", { ascending: true });

        if (checklistData && subQuestions) {
          // Process the sub-checklist questions just like we did for the main questions
          const processedSubQuestions = subQuestions.map((item: any) => ({
            id: item.id,
            text: item.pergunta,
            responseType: item.tipo_resposta,
            options: item.opcoes,
            isRequired: item.obrigatorio,
            order: item.ordem,
            parentQuestionId: item.parent_item_id || null,
            parentValue: item.condition_value || null,
            hint: item.hint || null,
            allowsPhoto: item.permite_foto || false,
            allowsVideo: item.permite_video || false,
            allowsAudio: item.permite_audio || false,
            weight: item.weight || 1,
          }));

          // Store the sub-checklist data linked to the parent question's ID for easy access
          subChecklistsMap[ref.id] = {
            ...checklistData,
            questions: processedSubQuestions,
          };
        }
      }

      setSubChecklists(subChecklistsMap);
      console.log(`Loaded ${Object.keys(subChecklistsMap).length} sub-checklists`);
    } catch (err: any) {
      console.error("Erro ao buscar dados da inspeção:", err);
      setError(err.message || "Erro ao carregar inspeção");
      setDetailedError(JSON.stringify(err, null, 2));
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
    groups,
    responses,
    company,
    responsible,
    subChecklists,
    setResponses,
    refreshData: fetchInspectionData,
  };
}
