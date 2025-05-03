
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ActionPlan,
  getActionPlans,
  getActionPlanByQuestionId,
  saveActionPlan as saveActionPlanService,
  deleteActionPlan as deleteActionPlanService,
  getActionPlanStats
} from '@/services/inspection/actionPlanService';

interface ActionPlansHookProps {
  plans: ActionPlan[];
  plansByQuestion: Record<string, ActionPlan>;
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  saveActionPlan: (data: {
    inspectionId: string;
    questionId: string;
    description: string;
    assignee?: string;
    dueDate?: Date;
    priority: string;
    status: string;
    id?: string;
  }) => Promise<ActionPlan>;
  deleteActionPlan: (id: string) => Promise<boolean>;
  refreshPlans: () => Promise<void>;
}

export function useActionPlans(inspectionId: string | undefined): ActionPlansHookProps {
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [plansByQuestion, setPlansByQuestion] = useState<Record<string, ActionPlan>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  const fetchPlans = useCallback(async () => {
    if (!inspectionId) return;
    
    try {
      setLoading(true);
      
      const fetchedPlans = await getActionPlans(inspectionId);
      setPlans(fetchedPlans);
      
      // Organize plans by question ID for easy lookup
      const plansByQuestionId: Record<string, ActionPlan> = {};
      fetchedPlans.forEach(plan => {
        plansByQuestionId[plan.question_id] = plan;
      });
      setPlansByQuestion(plansByQuestionId);
      
      // Get statistics
      const statsData = await getActionPlanStats(inspectionId);
      setStats(statsData);
      
      setError(null);
    } catch (err: any) {
      console.error('Error loading action plans:', err);
      setError(err.message || 'Failed to load action plans');
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  const saveActionPlan = useCallback(async (data: {
    inspectionId: string;
    questionId: string;
    description: string;
    assignee?: string;
    dueDate?: Date;
    priority: string;
    status: string;
    id?: string;
  }) => {
    try {
      const savedPlan = await saveActionPlanService(data);
      
      // Update local state
      await fetchPlans();
      
      toast.success(data.id ? 'Action plan updated successfully' : 'Action plan created successfully');
      return savedPlan;
    } catch (err: any) {
      console.error('Error saving action plan:', err);
      toast.error(err.message || 'Failed to save action plan');
      throw err;
    }
  }, [fetchPlans]);

  const deleteActionPlan = useCallback(async (id: string) => {
    try {
      await deleteActionPlanService(id);
      
      // Update local state
      await fetchPlans();
      
      toast.success('Action plan deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting action plan:', err);
      toast.error(err.message || 'Failed to delete action plan');
      throw err;
    }
  }, [fetchPlans]);

  // Initial load
  useEffect(() => {
    if (inspectionId) {
      fetchPlans();
    }
  }, [inspectionId, fetchPlans]);

  return {
    plans,
    plansByQuestion,
    loading,
    error,
    stats,
    saveActionPlan,
    deleteActionPlan,
    refreshPlans: fetchPlans
  };
}
