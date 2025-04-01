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
      const isSubChecklist = inspectionData.checklist?.category === "subchecklist";
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

      console.log(`Fetched ${checklistItems?.length || 0} questions for inspection ${inspectionId}`);

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

        // Check if the question has a sub-checklist
        const hasSubChecklist = !!item.sub_checklist_id;
        const subChecklistId = item.sub_checklist_id;
        
        // Log sub-checklist info for debugging
        if (hasSubChecklist) {
          console.log(`Question ${item.id} has sub-checklist with ID: ${subChecklistId}`);
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
          subChecklistId: subChecklistId,
          hasSubChecklist: hasSubChecklist,
          allowsPhoto: item.permite_foto || false,
          allowsVideo: item.permite_video || false,
          allowsAudio: item.permite_audio || false,
          weight: item.weight || 1,
        };
      });

      // Sort and set groups
      const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
      setGroups(sortedGroups.length > 0 ? sortedGroups : [DEFAULT_GROUP]); // Garantir que há pelo menos um grupo
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
      const questionsWithSubchecklist = parsedQuestions.filter(q => q.subChecklistId);
      console.log(`Found ${questionsWithSubchecklist.length} questions with sub-checklists`);
      
      const subChecklistsMap: Record<string, any> = {};

      if (questionsWithSubchecklist.length > 0) {
        for (const question of questionsWithSubchecklist) {
          console.log(`Fetching sub-checklist ${question.subChecklistId} for question ${question.id}`);
          
          try {
            // Fetch sub-checklist data
            const { data: checklistData, error: checklistError } = await supabase
              .from("checklists")
              .select("*")
              .eq("id", question.subChecklistId)
              .single();

            if (checklistError) {
              console.error(`Error fetching sub-checklist ${question.subChecklistId}:`, checklistError);
              continue;
            }

            // Fetch sub-checklist questions
            const { data: subQuestions, error: questionsError } = await supabase
              .from("checklist_itens")
              .select("*")
              .eq("checklist_id", question.subChecklistId)
              .order("ordem", { ascending: true });

            if (questionsError) {
              console.error(`Error fetching questions for sub-checklist ${question.subChecklistId}:`, questionsError);
              continue;
            }

            console.log(`Fetched ${subQuestions?.length || 0} questions for sub-checklist ${question.subChecklistId}`);

            if (checklistData && subQuestions && subQuestions.length > 0) {
              // Process the sub-checklist questions
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

              // Store the sub-checklist data linked to the parent question's ID
              subChecklistsMap[question.id] = {
                id: checklistData.id,
                title: checklistData.title,
                description: checklistData.description,
                questions: processedSubQuestions,
              };
              
              console.log(`Added sub-checklist ${checklistData.id} for question ${question.id} with ${processedSubQuestions.length} questions`);
            }
          } catch (err) {
            console.error(`Error processing sub-checklist for question ${question.id}:`, err);
          }
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
    if (inspectionId) {
      fetchInspectionData();
    } else {
      // Reset states if no inspection ID is provided
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
