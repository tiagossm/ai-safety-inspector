
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { INSPECTION_STATUSES } from "@/types/inspection";

export function useCreateInspection() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const extendedUser = user as AuthUser | null;

  const createInspection = async (checklistId: string) => {
    if (!checklistId) {
      throw new Error("ID do checklist não fornecido");
    }

    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }

    setCreating(true);
    setError(null);

    try {
      // First fetch the checklist to validate it exists
      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .select("id, title, description, total_questions")
        .eq("id", checklistId)
        .single();

      if (checklistError || !checklist) {
        throw new Error("Checklist não encontrado");
      }

      // Create the inspection
      const { data: inspection, error: inspectionError } = await supabase
        .from("inspections")
        .insert({
          checklist_id: checklistId,
          user_id: user.id,
          status: INSPECTION_STATUSES.PENDING,
          cnae: "00.00-0", // Default CNAE code as it's required
          checklist: {
            title: checklist.title,
            description: checklist.description || "",
            total_questions: checklist.total_questions || 0
          }
        })
        .select("id, status, created_at, updated_at")
        .single();

      if (inspectionError) {
        throw inspectionError;
      }

      return inspection;
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao criar inspeção";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return {
    createInspection,
    creating,
    error
  };
}
