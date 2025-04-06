
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useNavigate } from "react-router-dom";
import { useChecklistAISubmit } from "./useChecklistAISubmit";
import { useChecklistManualSubmit } from "./useChecklistManualSubmit";
import { useChecklistImportSubmit } from "./useChecklistImportSubmit";

export function useChecklistFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createChecklistWithAI } = useChecklistAISubmit();
  const { createManualChecklist } = useChecklistManualSubmit();
  const { importChecklist } = useChecklistImportSubmit();

  const handleFormSubmit = async (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist,
    questions: any[],
    file: File | null,
    aiPrompt: string,
    openAIAssistant: string = "",
    numQuestions: number = 10
  ): Promise<boolean> => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.warn("Já existe uma submissão em andamento...");
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Processando formulário...", { activeTab, form });
      
      let success = false;
      let checklistId: string | null = null;
      
      // Based on active tab, execute the appropriate function
      if (activeTab === "manual") {
        // Manual creation
        checklistId = await createManualChecklist(form, questions);
        success = !!checklistId;
        console.log("Manual creation result:", success, checklistId);
      } 
      else if (activeTab === "import") {
        // Import from spreadsheet
        if (!file) {
          toast.error("Por favor, selecione um arquivo para importar");
          return false;
        }
        
        checklistId = await importChecklist(file, form);
        success = !!checklistId;
        console.log("Import result:", success, checklistId);
      } 
      else if (activeTab === "ai") {
        // AI generation
        if (!aiPrompt.trim()) {
          toast.error("Por favor, forneça um prompt para gerar o checklist");
          return false;
        }
        
        checklistId = await createChecklistWithAI(aiPrompt, form, openAIAssistant, numQuestions);
        success = !!checklistId;
        console.log("AI generation result:", success, checklistId);
      }
      // If we got here, something went wrong
      else {
        console.error("Tab not recognized or not implemented:", activeTab);
        toast.error("Operação não suportada");
        return false;
      }
      
      if (success && checklistId) {
        toast.success("Checklist criado com sucesso!");
        navigate(`/new-checklists/${checklistId}`);
      }
      
      return success;
    } catch (error) {
      console.error("Erro ao processar formulário:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit: handleFormSubmit
  };
}
