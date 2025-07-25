import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InspectionResponse } from "./types";

export interface SubChecklistData {
  id: string;
  title: string;
  questions: any[];
  parent_question_id: string;
}

export function useOptimizedSubChecklistHandler(
  responses: Record<string, InspectionResponse>,
  setResponses: (responses: Record<string, InspectionResponse> | ((prev: Record<string, InspectionResponse>) => Record<string, InspectionResponse>)) => void
) {
  const [subChecklistDialogOpen, setSubChecklistDialogOpen] = useState(false);
  const [currentSubChecklist, setCurrentSubChecklist] = useState<SubChecklistData | null>(null);
  const [currentParentQuestionId, setCurrentParentQuestionId] = useState<string | null>(null);
  const [savingSubChecklist, setSavingSubChecklist] = useState(false);
  const [loadingSubChecklists, setLoadingSubChecklists] = useState<Record<string, boolean>>({});

  // Memoized function to safely parse sub-checklist responses
  const safeParseResponse = useCallback((responseData: any): Record<string, any> => {
    if (!responseData) return {};
    
    try {
      if (typeof responseData === 'string') {
        return JSON.parse(responseData);
      }
      if (typeof responseData === 'object') {
        return responseData;
      }
    } catch (error) {
      console.warn('Failed to parse sub-checklist response:', error);
    }
    
    return {};
  }, []);

  // Load sub-checklist data from database
  const loadSubChecklistData = useCallback(async (subChecklistId: string): Promise<SubChecklistData | null> => {
    try {
      setLoadingSubChecklists(prev => ({ ...prev, [subChecklistId]: true }));

      // Fetch sub-checklist details
      const { data: subChecklist, error: subChecklistError } = await supabase
        .from('checklists')
        .select('id, title, description')
        .eq('id', subChecklistId)
        .eq('is_sub_checklist', true)
        .single();

      if (subChecklistError) {
        console.error('Error fetching sub-checklist:', subChecklistError);
        return null;
      }

      // Fetch sub-checklist questions
      const { data: questions, error: questionsError } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id', subChecklistId)
        .order('ordem');

      if (questionsError) {
        console.error('Error fetching sub-checklist questions:', questionsError);
        return null;
      }

      return {
        id: subChecklist.id,
        title: subChecklist.title,
        questions: questions || [],
        parent_question_id: subChecklistId
      };
    } catch (error) {
      console.error('Error loading sub-checklist data:', error);
      return null;
    } finally {
      setLoadingSubChecklists(prev => ({ ...prev, [subChecklistId]: false }));
    }
  }, []);

  // Open sub-checklist dialog
  const handleOpenSubChecklist = useCallback(async (questionId: string, subChecklists: Record<string, any>) => {
    const subChecklistInfo = subChecklists[questionId];
    
    if (!subChecklistInfo) {
      toast.error("Sub-checklist não encontrado");
      return;
    }

    let subChecklistData: SubChecklistData | null = null;

    // Check if we already have the data loaded
    if (subChecklistInfo.questions && Array.isArray(subChecklistInfo.questions)) {
      subChecklistData = {
        id: subChecklistInfo.id || questionId,
        title: subChecklistInfo.title || "Sub-checklist",
        questions: subChecklistInfo.questions,
        parent_question_id: questionId
      };
    } else {
      // Load from database
      subChecklistData = await loadSubChecklistData(subChecklistInfo.id || questionId);
    }

    if (!subChecklistData) {
      toast.error("Erro ao carregar sub-checklist");
      return;
    }

    setCurrentSubChecklist(subChecklistData);
    setCurrentParentQuestionId(questionId);
    setSubChecklistDialogOpen(true);
  }, [loadSubChecklistData]);

  // Save sub-checklist responses with optimized validation
  const handleSaveSubChecklistResponses = useCallback(async (
    parentQuestionId: string, 
    subResponses: Record<string, any>
  ): Promise<void> => {
    if (!parentQuestionId) {
      return Promise.reject(new Error("ID da questão pai não fornecido"));
    }
    
    setSavingSubChecklist(true);
    
    try {
      // Validate sub-checklist responses
      const validResponses = Object.entries(subResponses).reduce((acc, [questionId, response]) => {
        if (response && (response.value !== undefined || response.mediaUrls?.length > 0)) {
          acc[questionId] = response;
        }
        return acc;
      }, {} as Record<string, any>);

      console.log("[useOptimizedSubChecklistHandler] Salvando respostas validadas:", parentQuestionId, validResponses);
      
      // Update responses using functional update for better performance
      setResponses((prev) => {
        const currentResponse = prev[parentQuestionId] || {};
        
        return {
          ...prev,
          [parentQuestionId]: {
            ...currentResponse,
            subChecklistResponses: validResponses,
            updatedAt: new Date().toISOString()
          } as InspectionResponse
        };
      });
      
      toast.success("Sub-checklist salvo com sucesso");
      setSubChecklistDialogOpen(false);
    } catch (error) {
      console.error("[useOptimizedSubChecklistHandler] Erro ao salvar respostas do sub-checklist:", error);
      toast.error("Erro ao salvar sub-checklist");
      throw error;
    } finally {
      setSavingSubChecklist(false);
    }
  }, [setResponses]);

  // Get current sub-checklist responses
  const getCurrentSubChecklistResponses = useCallback((parentQuestionId: string) => {
    if (!parentQuestionId || !responses[parentQuestionId]?.subChecklistResponses) {
      return {};
    }
    
    return safeParseResponse(responses[parentQuestionId].subChecklistResponses);
  }, [responses, safeParseResponse]);

  // Memoized sub-checklist statistics
  const subChecklistStats = useMemo(() => {
    const stats: Record<string, { total: number; answered: number; percentage: number }> = {};
    
    Object.entries(responses).forEach(([questionId, response]) => {
      if (response.subChecklistResponses) {
        const subResponses = safeParseResponse(response.subChecklistResponses);
        const subResponsesArray = Object.values(subResponses);
        const answeredCount = subResponsesArray.filter(
          (subResponse: any) => subResponse?.value !== undefined && subResponse?.value !== null
        ).length;
        
        stats[questionId] = {
          total: subResponsesArray.length,
          answered: answeredCount,
          percentage: subResponsesArray.length > 0 ? Math.round((answeredCount / subResponsesArray.length) * 100) : 0
        };
      }
    });
    
    return stats;
  }, [responses, safeParseResponse]);

  return {
    subChecklistDialogOpen,
    setSubChecklistDialogOpen,
    currentSubChecklist,
    currentParentQuestionId,
    savingSubChecklist,
    loadingSubChecklists,
    handleOpenSubChecklist,
    handleSaveSubChecklistResponses,
    getCurrentSubChecklistResponses,
    safeParseResponse,
    subChecklistStats
  };
}