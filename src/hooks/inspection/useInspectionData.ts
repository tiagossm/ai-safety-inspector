
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export function useInspectionData(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});
  const { user } = useAuth();

  const fetchInspectionData = useCallback(async () => {
    if (!inspectionId) {
      setError("ID da inspeção não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch inspection details
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select(`
          *,
          checklist:checklist_id(id, title, description)
        `)
        .eq("id", inspectionId)
        .single();

      if (inspectionError) throw inspectionError;
      if (!inspectionData) throw new Error("Inspeção não encontrada");

      setInspection(inspectionData);

      // Fetch company details if available
      if (inspectionData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", inspectionData.company_id)
          .single();

        if (!companyError && companyData) {
          setCompany(companyData);
        }
      }

      // Fetch responsible user if available
      if (inspectionData.responsible_id) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, name, email, phone")
          .eq("id", inspectionData.responsible_id)
          .single();

        if (!userError && userData) {
          setResponsible(userData);
        }
      }

      // Fetch checklist questions
      const { data: questionData, error: questionError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", inspectionData.checklist_id)
        .order("ordem", { ascending: true });

      if (questionError) throw questionError;
      
      // Process questions to identify groups and sub-checklists
      const groupsMap = new Map();
      const qIds = questionData?.map(q => q.id) || [];
      const subChecksIds: string[] = [];
      
      // Extract sub-checklist IDs
      questionData?.forEach(q => {
        if (q.sub_checklist_id) {
          subChecksIds.push(q.sub_checklist_id);
        }
        
        // Extract group info from hint field if it contains JSON
        if (q.hint && q.hint.startsWith('{') && q.hint.endsWith('}')) {
          try {
            const groupInfo = JSON.parse(q.hint);
            if (groupInfo.groupId && groupInfo.groupTitle) {
              if (!groupsMap.has(groupInfo.groupId)) {
                groupsMap.set(groupInfo.groupId, {
                  id: groupInfo.groupId,
                  title: groupInfo.groupTitle,
                  order: groupInfo.groupIndex || 0
                });
              }
            }
          } catch (e) {
            // If hint is not valid JSON, just continue
          }
        }
      });
      
      // Fetch sub-checklists if any
      if (subChecksIds.length > 0) {
        const { data: subChecklistsData, error: subChecklistsError } = await supabase
          .from("checklists")
          .select("id, title, description")
          .in("id", subChecksIds);
          
        if (subChecklistsError) {
          console.error("Error fetching sub-checklists:", subChecklistsError);
        } else if (subChecklistsData) {
          // Create a map of sub-checklist ID to sub-checklist data
          const subChecklistsMap: Record<string, any> = {};
          
          // For each sub-checklist, fetch its questions
          await Promise.all(subChecklistsData.map(async (subChecklist) => {
            const { data: subQuestions, error: subQuestionsError } = await supabase
              .from("checklist_itens")
              .select("*")
              .eq("checklist_id", subChecklist.id)
              .order("ordem", { ascending: true });
              
            if (subQuestionsError) {
              console.error(`Error fetching questions for sub-checklist ${subChecklist.id}:`, subQuestionsError);
            } else {
              subChecklistsMap[subChecklist.id] = {
                ...subChecklist,
                questions: subQuestions || []
              };
            }
          }));
          
          setSubChecklists(subChecklistsMap);
        }
      }
      
      // Sort groups by order
      const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
      
      // If no groups were found, create a default group
      if (sortedGroups.length === 0 && questionData && questionData.length > 0) {
        sortedGroups.push({
          id: "default",
          title: "Geral",
          order: 0
        });
      }
      
      setGroups(sortedGroups);
      setQuestions(questionData || []);

      // Fetch existing responses
      const { data: responseData, error: responseError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      if (responseError) throw responseError;

      // Also fetch sub-checklist responses if any
      const subChecklistResponses: Record<string, any> = {};
      
      if (responseData) {
        // Map responses by question ID for easier access
        const responsesMap = responseData.reduce((acc, response) => {
          // Check if response contains sub-checklist data
          if (response.answer && typeof response.answer === 'string' && response.answer.startsWith('{')) {
            try {
              const parsedAnswer = JSON.parse(response.answer);
              if (parsedAnswer.type === 'sub-checklist' && parsedAnswer.responses) {
                subChecklistResponses[response.question_id] = parsedAnswer.responses;
              }
            } catch (e) {
              // If not parseable JSON, proceed as normal
            }
          }
          
          acc[response.question_id] = response;
          return acc;
        }, {});
        
        setResponses(responsesMap);
      }
    } catch (error: any) {
      console.error("Error fetching inspection data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    fetchInspectionData();
  }, [fetchInspectionData]);

  const getFilteredQuestions = (groupId: string | null) => {
    if (!groupId) return [];
    
    // Filter out questions that are part of a sub-checklist
    const filteredQuestions = questions.filter(q => !q.parent_item_id);
    
    // If it's a default group but we don't have explicit group associations
    if (groupId === "default" && groups.length === 1) {
      return filteredQuestions;
    }
    
    return filteredQuestions.filter(q => {
      // Check if question belongs to this group based on hint
      if (q.hint && q.hint.startsWith('{') && q.hint.endsWith('}')) {
        try {
          const groupInfo = JSON.parse(q.hint);
          return groupInfo.groupId === groupId;
        } catch (e) {
          return false;
        }
      }
      return false;
    });
  };

  const getCompletionStats = () => {
    // Count total required questions
    const totalRequired = questions.filter(q => q.obrigatorio).length;
    
    // Count answered required questions
    const answered = questions.filter(q => 
      q.obrigatorio && responses[q.id] && responses[q.id].answer
    ).length;
    
    const percentage = totalRequired > 0 
      ? Math.round((answered / totalRequired) * 100) 
      : 0;
      
    return {
      total: questions.length,
      totalRequired,
      answered,
      percentage
    };
  };

  const handleResponseChange = async (questionId: string, value: string, notes?: string) => {
    // If it's a parent question with a sub-checklist, handle differently
    const question = questions.find(q => q.id === questionId);
    
    if (question && question.sub_checklist_id) {
      // For now, just store the value
      setResponses(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          question_id: questionId,
          inspection_id: inspectionId,
          answer: value,
          notes: notes || prev[questionId]?.notes || ""
        }
      }));
      return;
    }
    
    // Update local state
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        inspection_id: inspectionId,
        answer: value,
        notes: notes || prev[questionId]?.notes || ""
      }
    }));
    
    // If inspection status is still pending, update to in_progress
    if (inspection && inspection.status === 'pending') {
      try {
        await supabase
          .from("inspections")
          .update({ status: 'in_progress' })
          .eq("id", inspectionId);
          
        setInspection(prev => ({ ...prev, status: 'in_progress' }));
      } catch (error) {
        console.error("Error updating inspection status:", error);
      }
    }
  };

  const handleSaveSubChecklistResponses = async (
    parentQuestionId: string, 
    subResponses: Array<{questionId: string, value: string, comment?: string}>
  ) => {
    if (!inspectionId || !parentQuestionId) return;
    
    try {
      // Format the responses for storage
      const formattedAnswer = JSON.stringify({
        type: 'sub-checklist',
        responses: subResponses.reduce((acc, item) => {
          acc[item.questionId] = {
            value: item.value,
            comment: item.comment || ""
          };
          return acc;
        }, {})
      });
      
      // Check if we already have a response for this parent question
      const existingResponse = responses[parentQuestionId];
      
      if (existingResponse && existingResponse.id) {
        // Update existing response
        const { error } = await supabase
          .from("inspection_responses")
          .update({
            answer: formattedAnswer,
            updated_at: new Date().toISOString() // Fix: Convert Date to ISO string
          })
          .eq("id", existingResponse.id);
          
        if (error) throw error;
      } else {
        // Create new response
        const { error } = await supabase
          .from("inspection_responses")
          .insert({
            inspection_id: inspectionId,
            question_id: parentQuestionId,
            answer: formattedAnswer,
            created_at: new Date().toISOString() // Fix: Convert Date to ISO string
          });
          
        if (error) throw error;
      }
      
      // Update local state
      setResponses(prev => ({
        ...prev,
        [parentQuestionId]: {
          ...prev[parentQuestionId],
          question_id: parentQuestionId,
          inspection_id: inspectionId,
          answer: formattedAnswer
        }
      }));
      
      return true;
    } catch (error) {
      console.error("Error saving sub-checklist responses:", error);
      toast.error("Erro ao salvar respostas do sub-checklist");
      return false;
    }
  };

  const handleSaveInspection = async () => {
    if (!inspectionId) return;
    
    try {
      setSaving(true);
      
      // Prepare responses for insertion/update
      const responsesToSave = Object.values(responses);
      
      // Split into new and existing responses
      const newResponses = responsesToSave.filter(r => !r.id);
      const existingResponses = responsesToSave.filter(r => r.id);
      
      // Insert new responses
      if (newResponses.length > 0) {
        const { error: insertError } = await supabase
          .from("inspection_responses")
          .insert(
            newResponses.map(r => ({
              inspection_id: inspectionId,
              question_id: r.question_id,
              answer: r.answer,
              notes: r.notes
            }))
          );
          
        if (insertError) throw insertError;
      }
      
      // Update existing responses
      for (const response of existingResponses) {
        const { error: updateError } = await supabase
          .from("inspection_responses")
          .update({
            answer: response.answer,
            notes: response.notes,
            updated_at: new Date().toISOString() // Fix: Convert Date to ISO string
          })
          .eq("id", response.id);
          
        if (updateError) throw updateError;
      }
      
      // Update inspection status to in_progress if it was pending
      if (inspection && inspection.status === 'pending') {
        const { error: statusError } = await supabase
          .from("inspections")
          .update({ status: 'in_progress' })
          .eq("id", inspectionId);
          
        if (statusError) throw statusError;
        
        setInspection(prev => ({ ...prev, status: 'in_progress' }));
      }
      
      // Refresh data to get updated responses with IDs
      await fetchInspectionData();
      
      return true;
    } catch (error) {
      console.error("Error saving inspection:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const completeInspection = async () => {
    if (!inspectionId) return;
    
    try {
      // First save current responses
      await handleSaveInspection();
      
      // Then update inspection status to completed
      const { error } = await supabase
        .from("inspections")
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString() // Fix: Convert Date to ISO string
        })
        .eq("id", inspectionId);
        
      if (error) throw error;
      
      // Update local state
      setInspection(prev => ({ ...prev, status: 'completed' }));
      
      return true;
    } catch (error) {
      console.error("Error completing inspection:", error);
      throw error;
    }
  };

  const reopenInspection = async () => {
    if (!inspectionId) return;
    
    try {
      // Update inspection status to in_progress
      const { error } = await supabase
        .from("inspections")
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString() // Fix: Convert Date to ISO string
        })
        .eq("id", inspectionId);
        
      if (error) throw error;
      
      // Update local state
      setInspection(prev => ({ ...prev, status: 'in_progress' }));
      
      return true;
    } catch (error) {
      console.error("Error reopening inspection:", error);
      throw error;
    }
  };

  return {
    loading,
    saving,
    error,
    inspection,
    questions,
    responses,
    groups,
    company,
    responsible,
    subChecklists,
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
