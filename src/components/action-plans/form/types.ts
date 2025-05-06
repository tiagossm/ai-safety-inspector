
import { z } from "zod";

export interface ActionPlanFormData {
  id?: string;
  description: string;
  assignee?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  inspectionId?: string;
  questionId?: string;
}

// Define a complete ActionPlan type that's compatible with the service's version
export interface ActionPlan {
  id?: string; // Make id optional to match the service type
  description: string;
  assignee?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  inspection_id?: string;
  question_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Define the Zod schema for form validation
export const actionPlanSchema = z.object({
  description: z.string().min(3, { message: "Description is required and must be at least 3 characters" }),
  assignee: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'])
});

// Define the type based on the schema
export type ActionPlanFormValues = z.infer<typeof actionPlanSchema>;
