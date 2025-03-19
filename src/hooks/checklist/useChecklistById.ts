
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to validate UUID format
const isValidUUID = (id: string): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
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

      return data;
    },
    enabled: !!id && id !== "editor", // Only run query if ID exists and isn't "editor"
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error("Error in useChecklistById:", error);
        toast.error("Erro ao carregar checklist");
      }
    }
  });
}
