
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InspectionDetails, InspectionFilters } from "@/types/newChecklist";
import { useAuth } from "@/components/AuthProvider";

export function useInspections() {
  const [inspections, setInspections] = useState<InspectionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<InspectionFilters>({
    search: "",
    status: "all",
    priority: "all",
    companyId: "all",
    responsibleId: "all", 
    checklistId: "all",
    startDate: undefined,
    endDate: undefined
  });

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Fetch inspections without trying to join on responsible_id directly
      let query = supabase
        .from("inspections")
        .select(`
          *,
          companies:company_id(id, fantasy_name),
          checklist:checklist_id(id, title, description, total_questions)
        `);
      
      // Super admins see all inspections, others only see their own or company's
      if (user.tier !== "super_admin") {
        query = query.or(`user_id.eq.${user.id},responsible_id.eq.${user.id}`);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (!data) {
        setInspections([]);
        return;
      }
      
      // Now that we have inspections, fetch user data for responsible_id in a separate query
      const userIds = data
        .map(inspection => inspection.responsible_id)
        .filter(id => id !== null && id !== undefined);
      
      let responsiblesData = {};
      
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email, phone")
          .in("id", userIds);
          
        if (!usersError && usersData) {
          responsiblesData = usersData.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
        }
      }
      
      // Calculate progress for each inspection with optimized queries
      const inspectionsWithProgress = await Promise.all(data.map(async (inspection: any) => {
        // Optimized query to get count of responses for this inspection
        const { count: answeredQuestions, error: countError } = await supabase
          .from('inspection_responses')
          .select('*', { count: 'exact', head: true })
          .eq('inspection_id', inspection.id);
        
        if (countError) {
          console.error("Error fetching response count:", countError);
        }
        
        // Optimized query to get total questions count
        const { count: totalQuestions, error: questionError } = await supabase
          .from('checklist_itens')
          .select('*', { count: 'exact', head: true })
          .eq('checklist_id', inspection.checklist_id);
          
        if (questionError) {
          console.error("Error fetching question count:", questionError);
        }
        
        const progress = totalQuestions > 0 
          ? Math.round(((answeredQuestions || 0) / totalQuestions) * 100) 
          : 0;
          
        return {
          id: inspection.id,
          title: inspection.checklist?.title || "Sem título",
          description: inspection.checklist?.description,
          checklistId: inspection.checklist_id,
          companyId: inspection.company_id,
          responsibleId: inspection.responsible_id,
          scheduledDate: inspection.scheduled_date,
          status: (inspection.status || 'pending') as 'pending' | 'in_progress' | 'completed',
          createdAt: inspection.created_at,
          updatedAt: inspection.created_at,
          priority: (inspection.priority || 'medium') as 'low' | 'medium' | 'high',
          locationName: inspection.location,
          company: inspection.companies || null,
          responsible: inspection.responsible_id ? responsiblesData[inspection.responsible_id] : null,
          progress,
          // Additional fields from the database schema
          approval_notes: inspection.approval_notes,
          approval_status: inspection.approval_status,
          approved_by: inspection.approved_by,
          audio_url: inspection.audio_url,
          photos: inspection.photos || [],
          report_url: inspection.report_url,
          unit_id: inspection.unit_id,
          metadata: inspection.metadata,
          cnae: inspection.cnae,
          inspection_type: inspection.inspection_type,
          sync_status: inspection.sync_status
        };
      }));
      
      setInspections(inspectionsWithProgress);
    } catch (error: any) {
      console.error("Error fetching inspections:", error);
      setError(error.message);
      toast.error("Erro ao carregar inspeções", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [user]);

  // Apply filters
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        (inspection.title?.toLowerCase().includes(searchLower)) ||
        (inspection.company?.fantasy_name?.toLowerCase().includes(searchLower)) ||
        (inspection.responsible?.name?.toLowerCase().includes(searchLower));
      
      // Status filter
      const matchesStatus = filters.status === "all" || inspection.status === filters.status;
      
      // Priority filter
      const matchesPriority = filters.priority === "all" || inspection.priority === filters.priority;
      
      // Company filter
      const matchesCompany = filters.companyId === "all" || inspection.companyId === filters.companyId;
      
      // Responsible filter
      const matchesResponsible = filters.responsibleId === "all" || inspection.responsibleId === filters.responsibleId;
      
      // Checklist filter
      const matchesChecklist = filters.checklistId === "all" || inspection.checklistId === filters.checklistId;
      
      // Date filter
      let matchesDate = true;
      if (filters.startDate) {
        const scheduledDate = inspection.scheduledDate ? new Date(inspection.scheduledDate) : null;
        const startDate = filters.startDate;
        const endDate = filters.endDate || startDate;
        
        if (scheduledDate) {
          // Remove time component for date comparison
          const dateOnly = new Date(scheduledDate.setHours(0, 0, 0, 0));
          const startDateOnly = new Date(startDate.setHours(0, 0, 0, 0));
          const endDateOnly = new Date(endDate.setHours(23, 59, 59, 999));
          
          matchesDate = dateOnly >= startDateOnly && dateOnly <= endDateOnly;
        } else {
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && 
        matchesCompany && matchesResponsible && matchesChecklist && matchesDate;
    });
  }, [inspections, filters]);

  return {
    inspections: filteredInspections,
    loading,
    error,
    fetchInspections,
    filters,
    setFilters
  };
}

export function useInspectionData(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  // Load inspection data
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
          companies:company_id(id, fantasy_name, razao_social, address, cnae),
          checklist:checklist_id(id, title, description)
        `)
        .eq("id", inspectionId)
        .single();

      if (inspectionError) throw inspectionError;

      if (!inspectionData) {
        throw new Error("Inspeção não encontrada");
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

      // Fetch responsible user if available
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

      // Fetch checklist questions
      const { data: checklistItems, error: checklistError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", inspectionData.checklist_id)
        .order("ordem", { ascending: true });

      if (checklistError) throw checklistError;

      // Process questions and group them
      const questionsData = checklistItems.map((item: any) => ({
        id: item.id,
        text: item.pergunta,
        responseType: item.tipo_resposta,
        groupId: item.group_id,
        options: item.opcoes,
        isRequired: item.obrigatorio,
        order: item.ordem,
        parentQuestionId: item.parent_question_id || null,
        parentValue: item.parent_value || null,
        hint: item.hint || null,
        subChecklistId: item.sub_checklist_id || null,
      }));

      setQuestions(questionsData);

      // Extract unique groups
      const groupsData = checklistItems
        .filter((item: any) => item.group_id)
        .map((item: any) => ({
          id: item.group_id,
          title: item.group_title || "Grupo sem título",
        }))
        .reduce((unique: any[], group: any) => {
          // Only add if not already in the array
          if (!unique.some(g => g.id === group.id)) {
            unique.push(group);
          }
          return unique;
        }, []);

      setGroups(groupsData);

      // Fetch existing responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      if (responsesError) throw responsesError;

      // Convert responses array to object keyed by question_id
      const responsesObj = (responsesData || []).reduce((acc: Record<string, any>, curr: any) => {
        acc[curr.question_id] = {
          value: curr.value,
          comment: curr.comment,
          actionPlan: curr.action_plan,
          mediaUrls: curr.media_urls || [],
          subChecklistResponses: curr.sub_checklist_responses || {},
        };
        return acc;
      }, {});

      setResponses(responsesObj);

      // Fetch sub-checklists if any questions have them
      const subChecklistIds = questionsData
        .filter(q => q.subChecklistId)
        .map(q => ({ questionId: q.id, subChecklistId: q.subChecklistId }));

      if (subChecklistIds.length > 0) {
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  // Handle response changes
  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        ...data,
      },
    }));
  }, []);

  // Save inspection responses
  const handleSaveInspection = useCallback(async () => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      const responsesToSave = Object.entries(responses).map(([questionId, data]) => ({
        inspection_id: inspectionId,
        question_id: questionId,
        value: data.value,
        comment: data.comment || null,
        action_plan: data.actionPlan || null,
        media_urls: data.mediaUrls || [],
        sub_checklist_responses: data.subChecklistResponses || {},
        updated_at: new Date().toISOString(),
      }));

      // Upsert responses
      const { error } = await supabase
        .from("inspection_responses")
        .upsert(responsesToSave, {
          onConflict: "inspection_id,question_id",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      // Update inspection status to in_progress if it was pending
      if (inspection?.status === "pending") {
        const { error: updateError } = await supabase
          .from("inspections")
          .update({ status: "in_progress" })
          .eq("id", inspectionId);

        if (updateError) throw updateError;

        setInspection(prev => ({
          ...prev,
          status: "in_progress",
        }));
      }

      return true;
    } catch (error: any) {
      console.error("Error saving inspection:", error);
      throw error;
    }
  }, [inspectionId, responses, inspection?.status]);

  // Save sub-checklist responses
  const handleSaveSubChecklistResponses = useCallback(async (questionId: string, subResponses: any[]) => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      // First ensure the parent response exists
      const parentResponse = responses[questionId] || {};
      
      // Convert sub-responses array to object
      const subResponsesObj = subResponses.reduce((acc, curr) => {
        acc[curr.questionId] = curr;
        return acc;
      }, {});

      // Update parent response with sub-checklist responses
      const updatedParentResponse = {
        inspection_id: inspectionId,
        question_id: questionId,
        value: parentResponse.value || null,
        comment: parentResponse.comment || null,
        action_plan: parentResponse.actionPlan || null,
        media_urls: parentResponse.mediaUrls || [],
        sub_checklist_responses: subResponsesObj,
        updated_at: new Date().toISOString(),
      };

      // Upsert the parent response
      const { error } = await supabase
        .from("inspection_responses")
        .upsert([updatedParentResponse], {
          onConflict: "inspection_id,question_id",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error("Error saving sub-checklist responses:", error);
      throw error;
    }
  }, [inspectionId, responses]);

  // Complete inspection
  const completeInspection = useCallback(async () => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      // First save all responses
      await handleSaveInspection();

      // Update inspection status to completed
      const { error } = await supabase
        .from("inspections")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", inspectionId);

      if (error) throw error;

      setInspection(prev => ({
        ...prev,
        status: "completed",
      }));

      return true;
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      throw error;
    }
  }, [inspectionId, handleSaveInspection]);

  // Reopen inspection
  const reopenInspection = useCallback(async () => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      // Update inspection status to in_progress
      const { error } = await supabase
        .from("inspections")
        .update({ status: "in_progress" })
        .eq("id", inspectionId);

      if (error) throw error;

      setInspection(prev => ({
        ...prev,
        status: "in_progress",
      }));

      return true;
    } catch (error: any) {
      console.error("Error reopening inspection:", error);
      throw error;
    }
  }, [inspectionId]);

  // Get questions filtered by group
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    if (!groupId) return [];
    return questions.filter(q => q.groupId === groupId);
  }, [questions]);

  // Calculate completion stats
  const getCompletionStats = useCallback(() => {
    const total = questions.length;
    const answered = Object.values(responses).filter(r => r.value !== undefined && r.value !== null).length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    
    return {
      total,
      answered,
      percentage,
    };
  }, [questions, responses]);

  // Initial data fetch
  useEffect(() => {
    fetchInspectionData();
  }, [fetchInspectionData]);

  return {
    loading,
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
    reopenInspection,
  };
}
