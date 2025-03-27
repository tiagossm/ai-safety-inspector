
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
          allowsPhoto: item.permite_foto || false,
          allowsVideo: item.permite_video || false,
          allowsAudio: item.permite_audio || false,
          weight: item.weight || 1,
        }));

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
        
        if (extractedGroups.length > 0) {
          console.log(`Found ${extractedGroups.length} groups in hints`);
          
          questionsArray.forEach(question => {
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
          console.log("No groups found in hints, checking for direct group property");
          
          let hasGroupProperty = false;
          const directGroups = new Map();
          
          checklistItems.forEach((item: any) => {
            const groupId = item.group_id || null;
            const groupTitle = item.group_title || null;
            
            if (groupId) {
              hasGroupProperty = true;
              if (!directGroups.has(groupId)) {
                directGroups.set(groupId, {
                  id: groupId,
                  title: groupTitle || `Grupo ${directGroups.size + 1}`,
                  order: directGroups.size
                });
              }
              
              const questionToUpdate = questionsArray.find(q => q.id === item.id);
              if (questionToUpdate) {
                questionToUpdate.groupId = groupId;
              }
            }
          });
            
          if (hasGroupProperty && directGroups.size > 0) {
            console.log(`Found ${directGroups.size} direct groups`);
            setGroups(Array.from(directGroups.values()));
          } else {
            console.log("No direct groups found, creating default group");
            
            const defaultGroup = {
              id: 'default-group',
              title: 'Geral',
              order: 0
            };
            
            questionsArray.forEach(question => {
              question.groupId = defaultGroup.id;
            });
            
            setGroups([defaultGroup]);
          }
        }

        console.log("Questions after group processing:", questionsArray.length);
        setQuestions(questionsArray);
      }

      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      if (responsesError) {
        console.error("Error fetching responses:", responsesError);
        setDetailedError(responsesError);
        throw responsesError;
      }

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

      // Define questionsForSubChecklists to handle cases where questions might not be available yet
      const questionsForSubChecklists = questions.length > 0 ? questions : 
        (checklistItems && checklistItems.length > 0 ? 
          checklistItems.map((item: any) => ({
            id: item.id,
            subChecklistId: item.sub_checklist_id || null,
          })) : []);

      const subChecklistIds = questionsForSubChecklists
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
  }, [inspectionId, questions]);

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
