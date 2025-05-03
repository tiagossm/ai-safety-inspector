
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errors";

// Interface for action plan data
export interface ActionPlan {
  id?: string;
  inspection_id: string;
  question_id: string;
  description: string;
  assignee?: string | null;
  due_date?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  comments?: string[];
  attachments?: string[];
}

// Interface for action plan filter options
export interface ActionPlanFilters {
  status?: string | string[];
  priority?: string | string[];
  assignee?: string | string[];
  dueDate?: { start?: Date; end?: Date };
  searchTerm?: string;
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
    // Create a properly typed actionPlan object
    const actionPlan = {
      inspection_id: data.inspectionId,
      question_id: data.questionId,
      description: data.description, // This is required
      assignee: data.assignee || null,
      due_date: data.dueDate ? data.dueDate.toISOString() : null,
      priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
      status: data.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    };

    let result;

    if (data.id) {
      // Update existing action plan
      const updateData = {
        ...actionPlan,
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedData, error } = await supabase
        .from('inspection_action_plans')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      result = updatedData;
    } else {
      // Create new action plan
      const insertData = {
        ...actionPlan,
        created_at: new Date().toISOString()
      };
      
      const { data: newData, error } = await supabase
        .from('inspection_action_plans')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      result = newData;
    }

    return result as ActionPlan;
  } catch (error) {
    console.error("Error saving action plan:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get action plans for an inspection
 */
export async function getActionPlans(inspectionId: string, filters?: ActionPlanFilters): Promise<ActionPlan[]> {
  try {
    let query = supabase
      .from('inspection_action_plans')
      .select('*')
      .eq('inspection_id', inspectionId);
    
    // Apply filters if provided
    if (filters) {
      // Filter by status
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }
      
      // Filter by priority
      if (filters.priority) {
        if (Array.isArray(filters.priority)) {
          query = query.in('priority', filters.priority);
        } else {
          query = query.eq('priority', filters.priority);
        }
      }
      
      // Filter by assignee
      if (filters.assignee) {
        if (Array.isArray(filters.assignee)) {
          query = query.in('assignee', filters.assignee);
        } else {
          query = query.eq('assignee', filters.assignee);
        }
      }
      
      // Filter by due date range
      if (filters.dueDate) {
        if (filters.dueDate.start) {
          query = query.gte('due_date', filters.dueDate.start.toISOString());
        }
        if (filters.dueDate.end) {
          query = query.lte('due_date', filters.dueDate.end.toISOString());
        }
      }
      
      // Search in description or assignee
      if (filters.searchTerm) {
        const term = `%${filters.searchTerm}%`;
        query = query.or(`description.ilike.${term},assignee.ilike.${term}`);
      }
    }
    
    // Order by creation date, newest first
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    
    return data as ActionPlan[] || [];
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
    
    return data as ActionPlan | null;
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

/**
 * Add a comment to an action plan
 */
export async function addActionPlanComment(
  actionPlanId: string,
  comment: string,
  userId: string
): Promise<boolean> {
  try {
    // In a real implementation, you might have a separate table for comments
    // For simplicity, we're just logging this operation
    console.log(`Adding comment to action plan ${actionPlanId}: ${comment} by ${userId}`);
    return true;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Add an attachment to an action plan
 */
export async function addActionPlanAttachment(
  actionPlanId: string,
  fileUrl: string,
  fileName: string
): Promise<boolean> {
  try {
    // In a real implementation, you might have a separate table for attachments
    // For simplicity, we're just logging this operation
    console.log(`Adding attachment to action plan ${actionPlanId}: ${fileName} at ${fileUrl}`);
    return true;
  } catch (error) {
    console.error("Error adding attachment:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get statistics for action plans
 */
export async function getActionPlanStats(inspectionId: string): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}> {
  try {
    const { data, error } = await supabase
      .from('inspection_action_plans')
      .select('status, priority')
      .eq('inspection_id', inspectionId);

    if (error) throw error;
    
    const plans = data || [];
    
    return {
      total: plans.length,
      pending: plans.filter(p => p.status === 'pending').length,
      inProgress: plans.filter(p => p.status === 'in_progress').length,
      completed: plans.filter(p => p.status === 'completed').length,
      cancelled: plans.filter(p => p.status === 'cancelled').length,
      critical: plans.filter(p => p.priority === 'critical').length,
      high: plans.filter(p => p.priority === 'high').length,
      medium: plans.filter(p => p.priority === 'medium').length,
      low: plans.filter(p => p.priority === 'low').length,
    };
  } catch (error) {
    console.error("Error getting action plan stats:", error);
    throw new Error(getErrorMessage(error));
  }
}
