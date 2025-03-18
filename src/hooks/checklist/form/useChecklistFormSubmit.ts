
import { useNavigate } from "react-router-dom";
import { useChecklistSubmit } from "./useChecklistSubmit";
import { useChecklistAuth } from "./useChecklistAuth";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";

export function useChecklistFormSubmit() {
  const { isSubmitting, handleSubmit: submitChecklist } = useChecklistSubmit();
  const { user, refreshSession } = useChecklistAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist,
    questions: Array<{ text: string; type: string; required: boolean }>,
    file: File | null,
    aiPrompt: string,
    generateAIChecklist: (form: NewChecklist) => Promise<any>
  ) => {
    console.log("Form submit handler triggered");
    
    // Refresh token before submission to ensure we have a valid JWT
    const tokenValid = await refreshSession();
    
    if (!tokenValid) {
      console.error("Failed to refresh token before submission");
      toast.error("Erro de autenticação. Faça login novamente.");
      navigate("/auth");
      return false;
    }
    
    try {
      // Ensure user_id is set
      if (!form.user_id && user?.id) {
        form.user_id = user.id;
        console.log("Setting user_id in form:", user.id);
      }
      
      // Log debugging information
      console.log("Form being submitted:", {
        activeTab,
        title: form.title,
        company_id: form.company_id,
        user_id: form.user_id,
        user_tier: user?.tier,
        user_role: user?.role,
        fileIncluded: !!file,
        aiPromptLength: aiPrompt?.length || 0
      });
      
      let success = false;
      
      if (activeTab === "ai") {
        // Handle AI-generated checklist
        if (aiPrompt.trim()) {
          try {
            const result = await generateAIChecklist(form);
            console.log("AI generation result:", result);
            success = !!result;
          } catch (err) {
            console.error("Error generating AI checklist:", err);
            toast.error("Erro ao gerar checklist com IA. Tente novamente mais tarde.");
            return false;
          }
        }
      } else {
        success = await submitChecklist(e, activeTab, form, questions, file, aiPrompt);
      }
      
      if (success) {
        console.log("Submission successful");
        return true;
      } else {
        console.error("Submission failed but no exception thrown");
        return false;
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    }
  };

  return {
    isSubmitting,
    handleFormSubmit
  };
}
