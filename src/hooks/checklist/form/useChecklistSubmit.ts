
import { useState } from "react";
import { NewChecklist } from "@/types/checklist";
import { useManualSubmit } from "./useManualSubmit";
import { useAdvancedSubmit } from "./useAdvancedSubmit";
import { useChecklistSession } from "./useChecklistSession";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useChecklistSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sessionChecked, verifySession } = useChecklistSession();
  const { submitManualChecklist } = useManualSubmit();
  const { submitImportChecklist, submitAIChecklist } = useAdvancedSubmit();
  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist,
    questions: Array<{ text: string; type: string; required: boolean }>,
    file: File | null,
    aiPrompt: string
  ) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate submit");
      return false;
    }
    
    // Basic validation based on active tab
    if (activeTab === "manual" && !form.title.trim()) {
      toast.error("O título é obrigatório");
      return false;
    } else if (activeTab === "import" && !file) {
      toast.error("Por favor, selecione um arquivo para importar");
      return false;
    } else if (activeTab === "ai" && !aiPrompt.trim()) {
      toast.error("Por favor, forneça um prompt para gerar o checklist");
      return false;
    }
    
    console.log(`Starting checklist creation via ${activeTab} tab`);
    setIsSubmitting(true);
    
    try {
      // Verify session is valid before proceeding
      const sessionValid = await verifySession();
      if (!sessionValid) {
        setIsSubmitting(false);
        return false;
      }
      
      let success = false;
      
      // Handle submission based on active tab
      if (activeTab === "manual") {
        success = await submitManualChecklist(form, questions);
      } 
      else if (activeTab === "import" && file) {
        success = await submitImportChecklist(file, form);
      } 
      else if (activeTab === "ai") {
        success = await submitAIChecklist(form, aiPrompt);
      }
      
      return success;
    } catch (error) {
      console.error("Error in form submission:", error);
      let errorMessage = "Erro ao criar checklist.";
      
      if (error instanceof Error) {
        if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('auth')) {
          errorMessage += " Problema de autenticação. Tente fazer login novamente.";
          navigate("/auth");
        } else {
          errorMessage += ` ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    sessionChecked
  };
}
