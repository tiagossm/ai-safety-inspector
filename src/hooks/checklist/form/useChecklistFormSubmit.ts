
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useNavigate } from "react-router-dom";
import { useChecklistAISubmit } from "./useChecklistAISubmit";
import { useChecklistManualSubmit } from "./useChecklistManualSubmit";
import { useChecklistImportSubmit } from "./useChecklistImportSubmit";
import { NewChecklist as NewChecklistType, ChecklistOrigin } from "@/types/newChecklist";

export function useChecklistFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createChecklistWithAI } = useChecklistAISubmit();
  const { createManualChecklist } = useChecklistManualSubmit();
  const { importChecklist } = useChecklistImportSubmit();

  // Helper function to ensure status is "active" | "inactive"
  const normalizeStatus = (status?: string): "active" | "inactive" => {
    if (status === 'active' || status === 'inactive') {
      return status;
    }
    return 'active';
  };
  
  // Helper to ensure origin is a valid ChecklistOrigin type
  const normalizeOrigin = (origin?: string): ChecklistOrigin => {
    if (origin === 'manual' || origin === 'ia' || origin === 'csv') {
      return origin as ChecklistOrigin;
    }
    return 'manual';
  };

  const handleFormSubmit = async (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist | NewChecklistType,
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
      
      // Set the origin based on the active tab
      let origin: ChecklistOrigin = 'manual';
      
      // Map tab to origin type
      if (activeTab === 'ai') {
        origin = 'ia';
      } else if (activeTab === 'import') {
        origin = 'csv';
      }

      // Make sure we're using the correct status type and preserving the origin
      const processedForm = {
        ...form,
        status: normalizeStatus(form.status),
        origin: form.origin ? normalizeOrigin(form.origin) : origin,
        company_id: form.company_id === "none" ? null : form.company_id
      };
      
      console.log("Processed form with origin:", processedForm);
      
      // Based on active tab, execute the appropriate function
      if (activeTab === "manual") {
        // Manual creation
        checklistId = await createManualChecklist(processedForm, questions);
        success = !!checklistId;
        console.log("Manual creation result:", success, checklistId);
      } 
      else if (activeTab === "import") {
        // Import from spreadsheet
        if (!file) {
          toast.error("Por favor, selecione um arquivo para importar");
          return false;
        }
        
        checklistId = await importChecklist(file, processedForm);
        success = !!checklistId;
        console.log("Import result:", success, checklistId);
      } 
      else if (activeTab === "ai") {
        // AI generation
        if (!aiPrompt.trim()) {
          toast.error("Por favor, forneça um prompt para gerar o checklist");
          return false;
        }
        
        checklistId = await createChecklistWithAI(aiPrompt, processedForm, openAIAssistant, numQuestions);
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
