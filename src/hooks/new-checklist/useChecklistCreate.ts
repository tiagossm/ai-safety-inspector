import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { checklistService } from "@/services/checklist/checklistService";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { handleApiError } from "@/utils/errors";

/**
 * Hook for creating a new checklist
 */
export function useChecklistCreate() {
  const mutation = useMutation(
    async ({ 
      checklist, 
      questions,
      groups 
    }: {
      checklist: NewChecklistPayload;
      questions: ChecklistQuestion[];
      groups: ChecklistGroup[];
    }): Promise<{ id: string }> => {
      try {
        // Prepare data for API
        const normalizedChecklist: Record<string, any> = {
          title: checklist.title,
          description: checklist.description || "",
          status: checklist.status || "active",
          status_checklist: checklist.status_checklist || "ativo",
        };

        // Add optional fields if they exist
        if (checklist.category) {
          normalizedChecklist.category = checklist.category;
        }

        if (checklist.company_id) {
          normalizedChecklist.company_id = checklist.company_id;
        }
        
        if (checklist.origin) {
          normalizedChecklist.origin = checklist.origin;
        }

        if (checklist.is_template !== undefined) {
          normalizedChecklist.is_template = checklist.is_template;
        }

        if (checklist.responsible_id) {
          normalizedChecklist.responsible_id = checklist.responsible_id;
        }
        
        if (checklist.due_date) {
          normalizedChecklist.due_date = checklist.due_date;
        }

        // Call the service to create the checklist
        const result = await checklistService.createChecklist(
          normalizedChecklist,
          questions,
          groups
        );

        console.log("Checklist created:", result);
        return { id: result.id };
      } catch (error) {
        const errorMessage = handleApiError(
          error,
          "Failed to create checklist"
        );
        throw new Error(errorMessage);
      }
    },
    {
      onSuccess: () => {
        toast.success("Checklist created successfully!");
      },
      onError: (error: any) => {
        handleApiError(error, "Failed to create checklist");
      },
    }
  );

  return mutation;
}
