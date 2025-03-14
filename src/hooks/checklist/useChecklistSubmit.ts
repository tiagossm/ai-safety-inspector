
import { useState } from "react";
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist"; 
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { useChecklistAI } from "@/hooks/checklist/form/useChecklistAI";
import { useChecklistImport } from "@/hooks/checklist/form/useChecklistImport";

export function useChecklistSubmit() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const createChecklist = useCreateChecklist();
  const { generateAIChecklist } = useChecklistAI();
  const { importFromFile } = useChecklistImport();
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;

  const handleSubmit = async (
    e: React.FormEvent,
    form: NewChecklist,
    activeTab: string,
    file?: File | null,
    aiPrompt?: string,
    numQuestions?: number
  ) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate submit");
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Starting submission process, active tab:", activeTab);
      
      // Ensure the form has a user_id
      if (!form.user_id && typedUser?.id) {
        form.user_id = typedUser.id;
      }
      
      if (!form.user_id) {
        console.error("No user ID available for checklist creation");
        toast.error("Você precisa estar autenticado para criar um checklist");
        return false;
      }
      
      console.log("Submitting form with user_id:", form.user_id);
      
      let result = false;
      
      // Handle different creation methods based on the active tab
      if (activeTab === "manual") {
        console.log("Creating checklist manually with form:", form);
        const response = await createChecklist.mutateAsync(form);
        result = !!response;
      } 
      else if (activeTab === "import" && file) {
        console.log("Importing checklist from file:", file.name);
        const importResult = await importFromFile(file, form);
        result = !!importResult;
      } 
      else if (activeTab === "ai" && aiPrompt && numQuestions) {
        console.log("Generating checklist with AI using prompt:", aiPrompt);
        const aiResult = await generateAIChecklist(form);
        result = !!aiResult;
      }
      else {
        console.error("Invalid active tab or missing required data");
        toast.error("Dados incompletos para criar o checklist");
        return false;
      }
      
      if (result) {
        toast.success("Checklist criado com sucesso!");
      }
      
      return result;
    } catch (error: any) {
      console.error("Error submitting checklist:", error);
      toast.error(`Erro ao criar checklist: ${error.message || "Tente novamente"}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
