
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export function useInspectionData(inspectionId: string | undefined) {
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

      // Fetch inspection data with related tables
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select(`
          *,
          companies:company_id(id, fantasy_name, address, cnae),
          checklist:checklist_id(id, title, description)
        `)
        .eq("id", inspectionId)
        .single();

      if (inspectionError) {
        console.error("Error fetching inspection:", inspectionError);
        setDetailedError(inspectionError);
        throw inspectionError;
      }

      if (!inspectionData) {
        throw new Error("Inspeção não encontrada");
      }

      console.log("Loaded inspection data:", inspectionData);

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

      // Fetch responsible user data if available
      if (inspectionData.responsible_id) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", inspectionData.responsible_id)
          .single();

        if (!userError && userData) {
          setResponsible(userData);
        }
      }

      // Fetch checklist items
      const { data: checklistItems, error: checklistError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", inspectionData.checklist_id)
        .order("ordem", { ascending: true });

      if (checklistError) {
        console.error("Error fetching checklist items:", checklistError);
        setDetailedError(checklistError);
        throw checklistError;
      }

      console.log(`Loaded ${checklistItems?.length || 0} checklist items for inspection ${inspectionId}`);

      if (!checklistItems || checklistItems.length === 0) {
        console.warn("No checklist items found for this inspection");
        setQuestions([]);
        setGroups([]);
      } else {
        // Process checklist items into questions
        const questionsData = checklistItems.map((item: any) => ({
          id: item.id,
          text: item.pergunta,
          responseType: item.tipo_resposta,
          groupId: null, // We'll set this after processing groups
          options: item.opcoes,
          isRequired: item.obrigatorio,
          order: item.ordem,
          parentQuestionId: item.parent_item_id || null,
          parentValue: item.condition_value || null,
          hint: item.hint || null,
          subChecklistId: item.sub_checklist_id || null,
          allowsPhoto: item.permite_foto || false,
          allowsVideo: item.permite_video || false,
          allowsAudio: item.permite_audio || false,
          weight: item.weight || 1,
        }));

        // Process groups from hints
        const groupsMap = new Map();
        
        checklistItems.forEach((item: any) => {
          if (item.hint && typeof item.hint === 'string' && item.hint.includes('groupId')) {
            try {
              const hintData = JSON.parse(item.hint);
              if (hintData.groupId && hintData.groupTitle) {
                if (!groupsMap.has(hintData.groupId)) {
                  groupsMap.set(hintData.groupId, {
                    id: hintData.groupId,
                    title: hintData.groupTitle,
                    order: hintData.groupIndex || 0
                  });
                }
              }
            } catch (e) {
              console.warn(`Failed to parse hint as JSON: ${item.hint}`, e);
            }
          }
        });
        
        const extractedGroups = Array.from(groupsMap.values());
        
        // If we found groups in the hints, use those
        if (extractedGroups.length > 0) {
          console.log(`Found ${extractedGroups.length} groups in hints`);
          
          // Assign group IDs to questions based on hint
          questionsData.forEach(question => {
            const item = checklistItems.find((i: any) => i.id === question.id);
            if (item?.hint && typeof item.hint === 'string' && item.hint.includes('groupId')) {
              try {
                const hintData = JSON.parse(item.hint);
                if (hintData.groupId && groupsMap.has(hintData.groupId)) {
                  question.groupId = hintData.groupId;
                }
              } catch (e) {
                // Already logged above
              }
            }
          });
          
          setGroups(extractedGroups.sort((a, b) => a.order - b.order));
        } else {
          console.log("No groups found in hints, checking for direct group_id");
          
          // Look for direct group_id property
          const directGroups = checklistItems
            .filter((item: any) => item.group_id)
            .map((item: any) => ({
              id: item.group_id,
              title: item.group_title || "Grupo sem título",
            }))
            .reduce((unique: any[], group: any) => {
              if (!unique.some(g => g.id === group.id)) {
                unique.push(group);
              }
              return unique;
            }, []);
            
          if (directGroups.length > 0) {
            console.log(`Found ${directGroups.length} direct groups`);
            
            // Assign direct group IDs to questions
            questionsData.forEach(question => {
              const item = checklistItems.find((i: any) => i.id === question.id);
              if (item?.group_id) {
                question.groupId = item.group_id;
              }
            });
            
            setGroups(directGroups);
          } else {
            console.log("No direct groups found, creating default group");
            
            // Create a default group
            const defaultGroup = {
              id: 'default-group',
              title: 'Geral',
              order: 0
            };
            
            // Assign all questions to the default group
            questionsData.forEach(question => {
              question.groupId = defaultGroup.id;
            });
            
            setGroups([defaultGroup]);
          }
        }

        console.log("Questions after group processing:", questionsData.length);
        setQuestions(questionsData);
      }

      // Fetch existing responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      if (responsesError) {
        console.error("Error fetching responses:", responsesError);
        setDetailedError(responsesError);
        throw responsesError;
      }

      // Map responses to our format
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

      // Load sub-checklists if needed
      const subChecklistIds = questionsData
        .filter(q => q.subChecklistId)
        .map(q => ({ questionId: q.id, subChecklistId: q.subChecklistId }));

      if (subChecklistIds.length > 0) {
        console.log(`Loading ${subChecklistIds.length} sub-checklists`);
        const subChecklistsData: Record<string, any> = {};

        await Promise.all(
          subChecklistIds.map(async ({ questionId, subChecklistId }) => {
            try {
              const { data: checklistData, error: checklistError } = await supabase
                .from("checklists")
                .select("*")
                .eq("id", subChecklistId)
                .single();

              if (checklistError) throw checklistError;

              const { data: subQuestions, error: subQuestionsError } = await supabase
                .from("checklist_itens")
                .select("*")
                .eq("checklist_id", subChecklistId)
                .order("ordem", { ascending: true });

              if (subQuestionsError) throw subQuestionsError;

              console.log(`Loaded sub-checklist ${subChecklistId} with ${subQuestions.length} questions`);

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
            } catch (error) {
              console.error(`Error fetching sub-checklist for question ${questionId}:`, error);
            }
          })
        );

        setSubChecklists(subChecklistsData);
      }
    } catch (error: any) {
      console.error("Error fetching inspection data:", error);
      setError(error.message || "Erro ao carregar dados da inspeção");
      if (!error.message && error.code) {
        setError(`Erro ${error.code}: ${error.details || error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  // Fetch data on mount and when inspectionId changes
  useEffect(() => {
    fetchInspectionData();
  }, [fetchInspectionData]);

  // Handles changes to responses
  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        ...data,
      },
    }));
  }, []);

  // Saves all responses to the database
  const handleSaveInspection = useCallback(async () => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      const responsesToSave = Object.entries(responses).map(([questionId, data]) => ({
        inspection_id: inspectionId,
        question_id: questionId,
        answer: data.value,
        notes: data.comment || null,
        action_plan: data.actionPlan || null,
        media_urls: data.mediaUrls || [],
        sub_checklist_responses: data.subChecklistResponses || {},
        updated_at: new Date().toISOString(),
      }));

      if (responsesToSave.length === 0) {
        console.log("No responses to save");
        return;
      }

      console.log(`Saving ${responsesToSave.length} responses`);

      const { error } = await supabase
        .from("inspection_responses")
        .upsert(responsesToSave, {
          onConflict: "inspection_id,question_id",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      // If the inspection was in pending status, update it to in_progress
      if (inspection?.status === "pending") {
        const { error: updateError } = await supabase
          .from("inspections")
          .update({ status: "in_progress" })
          .eq("id", inspectionId);

        if (updateError) throw updateError;

        setInspection(prev => ({
          ...prev,
          status: "in_progress"
        }));
      }

      return true;
    } catch (error: any) {
      console.error("Error saving inspection responses:", error);
      throw new Error(`Erro ao salvar respostas: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId, inspection, responses]);

  // Saves responses for a sub-checklist
  const handleSaveSubChecklistResponses = useCallback(async (parentQuestionId: string, responses: any[]) => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      // Format the sub-checklist responses
      const formattedResponses = responses.map(response => ({
        inspection_id: inspectionId,
        question_id: response.questionId,
        answer: response.value,
        notes: response.comment || null,
        action_plan: response.actionPlan || null,
        media_urls: response.mediaUrls || [],
        updated_at: new Date().toISOString(),
      }));

      // Save the sub-checklist responses
      const { error } = await supabase
        .from("inspection_responses")
        .upsert(formattedResponses, {
          onConflict: "inspection_id,question_id",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error("Error saving sub-checklist responses:", error);
      throw new Error(`Erro ao salvar respostas do sub-checklist: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId]);

  // Marks the inspection as completed
  const completeInspection = useCallback(async () => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      // Save any pending changes first
      await handleSaveInspection();

      // Update the inspection status to completed
      const { error } = await supabase
        .from("inspections")
        .update({ status: "completed" })
        .eq("id", inspectionId);

      if (error) throw error;

      setInspection(prev => ({
        ...prev,
        status: "completed"
      }));

      return true;
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      throw new Error(`Erro ao finalizar inspeção: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId, handleSaveInspection]);

  // Reopens a completed inspection
  const reopenInspection = useCallback(async () => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      const { error } = await supabase
        .from("inspections")
        .update({ status: "in_progress" })
        .eq("id", inspectionId);

      if (error) throw error;

      setInspection(prev => ({
        ...prev,
        status: "in_progress"
      }));

      return true;
    } catch (error: any) {
      console.error("Error reopening inspection:", error);
      throw new Error(`Erro ao reabrir inspeção: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId]);

  // Filters questions by groupId
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    if (!groupId) return [];
    
    console.log(`Filtering questions for group ${groupId}. Total questions: ${questions.length}`);
    return questions.filter(q => q.groupId === groupId);
  }, [questions]);

  // Calculates completion statistics
  const getCompletionStats = useCallback(() => {
    const totalQuestions = questions.length;
    if (totalQuestions === 0) return { percentage: 0, answered: 0, total: 0 };

    const answered = Object.keys(responses).filter(questionId => 
      responses[questionId]?.value !== undefined && 
      responses[questionId]?.value !== null
    ).length;

    const percentage = Math.round((answered / totalQuestions) * 100);
    
    return { percentage, answered, total: totalQuestions };
  }, [questions, responses]);

  return {
    loading,
    inspection,
    questions,
    responses,
    groups,
    company,
    responsible,
    subChecklists,
    error,
    detailedError,
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    getFilteredQuestions,
    getCompletionStats,
    refreshData: fetchInspectionData,
    completeInspection,
    reopenInspection
  };
}
