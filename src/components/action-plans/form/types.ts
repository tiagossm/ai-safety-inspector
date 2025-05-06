
import * as z from "zod";

// Define schema for action plan form
export const actionPlanSchema = z.object({
  description: z.string().min(1, "Description is required"),
  assignee: z.string().optional(),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  dueDate: z.date().optional(),
});

export type ActionPlanFormValues = z.infer<typeof actionPlanSchema>;

export type ActionPlanFormData = {
  inspectionId: string;
  questionId: string;
  id?: string;
  description: string;
  assignee?: string;
  dueDate?: Date;
  priority: string;
  status: string;
};
