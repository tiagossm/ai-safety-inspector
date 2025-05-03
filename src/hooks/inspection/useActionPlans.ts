
import { useState, useEffect, useCallback } from "react";
import { 
  saveActionPlan, 
  getActionPlans, 
  getActionPlanByQuestionId,
  deleteActionPlan,
  ActionPlan 
} from "@/services/inspection/actionPlanService";

export function useActionPlans(inspectionId: string) {
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plansByQuestion, setPlansByQuestion] = useState<Record<string, ActionPlan>>({});

  // Fetch action plans for the inspection
  const fetchActionPlans = useCallback(async () => {
    if (!inspectionId) return;
    
    try {
      setLoading(true);
      const plans = await getActionPlans(inspectionId);
      setActionPlans(plans);
      
      // Create a map of plans by question ID for easier lookup
      const planMap: Record<string, ActionPlan> = {};
      plans.forEach(plan => {
        planMap[plan.question_id] = plan;
      });
      
      setPlansByQuestion(planMap);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching action plans:", err);
      setError(err.message || "Erro ao carregar planos de ação");
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  // Handle saving a new plan or updating an existing one
  const handleSaveActionPlan = useCallback(async (planData: any) => {
    try {
      const savedPlan = await saveActionPlan(planData);
      
      setActionPlans(prev => {
        // Replace if exists or add new
        const exists = prev.some(p => p.id === savedPlan.id);
        if (exists) {
          return prev.map(p => p.id === savedPlan.id ? savedPlan : p);
        } else {
          return [...prev, savedPlan];
        }
      });
      
      setPlansByQuestion(prev => ({
        ...prev,
        [savedPlan.question_id]: savedPlan
      }));
      
      return savedPlan;
    } catch (error: any) {
      console.error("Error saving action plan:", error);
      throw new Error(error.message || "Erro ao salvar plano de ação");
    }
  }, []);

  // Handle deleting an action plan
  const handleDeleteActionPlan = useCallback(async (id: string, questionId: string) => {
    try {
      await deleteActionPlan(id);
      
      setActionPlans(prev => prev.filter(p => p.id !== id));
      setPlansByQuestion(prev => {
        const newPlans = { ...prev };
        delete newPlans[questionId];
        return newPlans;
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting action plan:", error);
      throw new Error(error.message || "Erro ao excluir plano de ação");
    }
  }, []);

  // Get action plan for a specific question
  const getActionPlanForQuestion = useCallback((questionId: string): ActionPlan | null => {
    return plansByQuestion[questionId] || null;
  }, [plansByQuestion]);

  // Load action plans on mount
  useEffect(() => {
    fetchActionPlans();
  }, [fetchActionPlans]);

  return {
    actionPlans,
    loading,
    error,
    plansByQuestion,
    fetchActionPlans,
    saveActionPlan: handleSaveActionPlan,
    deleteActionPlan: handleDeleteActionPlan,
    getActionPlanForQuestion
  };
}
