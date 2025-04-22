
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistWithStats } from "@/types/newChecklist";
import { normalizeResponseType } from "@/utils/inspection/normalizationUtils";

// Function to validate UUID format
const isValidUUID = (id: string): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Helper function to transform raw checklist data
const transformChecklistData = (data: any): ChecklistWithStats => {
  if (!data) return null;
  
  return {
    id: data.id,
    title: data.title || "",
    description: data.description || "",
    isTemplate: data.is_template || false,
    status: data.status || "active",
    category: data.category || "",
    responsibleId: data.responsible_id || null,
    companyId: data.company_id || null,
    userId: data.user_id || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dueDate: data.due_date,
    isSubChecklist: data.is_sub_checklist || false,
    origin: data.origin || "manual",
    totalQuestions: data.total_questions || 0,
    completedQuestions: 0,
    questions: [], // Will be populated separately if needed
    groups: []     // Will be populated separately if needed
  };
};

export function useChecklistById(id: string) {
  return useQuery({
    queryKey: ["checklists", id],
    queryFn: async () => {
      // Skip query if ID is empty or "editor"
      if (!id || id === "editor") {
        return null;
      }

      // Validate UUID format to prevent DB errors
      if (!isValidUUID(id)) {
        console.error("Invalid UUID format:", id);
        throw new Error("ID de checklist inválido");
      }

      console.log(`Fetching checklist with ID: ${id}`);
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching checklist:", error);
        throw error;
      }

      // Transform the data to expected format with camelCase properties
      return transformChecklistData(data);
    },
    enabled: !!id && id !== "editor", // Only run query if ID exists and isn't "editor"
    retry: 1,
    gcTime: 300000, // 5 minutes
    staleTime: 60000, // 1 minute
  });
}
