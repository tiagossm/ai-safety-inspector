
import { ActionPlan } from "@/types/inspection";

export interface ActionPlanWithRelations extends Omit<ActionPlan, 'status' | 'priority'> {
  status: string;
  priority: string;
  inspection?: {
    id: string;
    company?: {
      fantasy_name: string;
    };
  };
  question?: {
    pergunta?: string;
  } | null;
}
