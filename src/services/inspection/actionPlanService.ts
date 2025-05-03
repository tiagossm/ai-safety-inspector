
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import { toast } from "sonner";

// Interface for action plan data
export interface ActionPlan {
  id?: string;
  inspection_id: string;
  question_id: string;
  description: string;
  assignee?: string;
  due_date?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

/**
 * Save or update an action plan
 */
export async function saveActionPlan(data: {
  inspectionId: string;
  questionId: string;
  description: string;
  assignee?: string;
  dueDate?: Date;
  priority: string;
  status: string;
  id?: string;
}): Promise<ActionPlan> {
  try {
    const actionPlan: Partial<ActionPlan> = {
      inspection_id: data.inspectionId,
      question_id: data.questionId,
      description: data.description,
      assignee: data.assignee || null,
      due_date: data.dueDate ? data.dueDate.toISOString() : null,
      priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
      status: data.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    };

    let result;

    if (data.id) {
      // Update existing action plan
      actionPlan.updated_at = new Date().toISOString();
      
      const { data: updatedData, error } = await supabase
        .from('inspection_action_plans')
        .update(actionPlan)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      result = updatedData;
    } else {
      // Create new action plan
      actionPlan.created_at = new Date().toISOString();
      
      const { data: newData, error } = await supabase
        .from('inspection_action_plans')
        .insert(actionPlan)
        .select()
        .single();

      if (error) throw error;
      result = newData;
    }

    return result;
  } catch (error) {
    console.error("Error saving action plan:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get action plans for an inspection
 */
export async function getActionPlans(inspectionId: string): Promise<ActionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('inspection_action_plans')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching action plans:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get action plan by question ID
 */
export async function getActionPlanByQuestionId(
  inspectionId: string, 
  questionId: string
): Promise<ActionPlan | null> {
  try {
    const { data, error } = await supabase
      .from('inspection_action_plans')
      .select('*')
      .eq('inspection_id', inspectionId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching action plan:", error);
    return null;
  }
}

/**
 * Delete an action plan
 */
export async function deleteActionPlan(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inspection_action_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting action plan:", error);
    throw new Error(getErrorMessage(error));
  }
}
