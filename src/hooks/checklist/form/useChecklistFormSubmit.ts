
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useAdvancedSubmit } from "./useAdvancedSubmit";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { useNavigate } from "react-router-dom";
import { useManualSubmit } from "./useManualSubmit";

export function useChecklistFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitManualChecklist } = useManualSubmit();
  const { submitImportChecklist, submitAIChecklist } = useAdvancedSubmit();
  const createChecklist = useCreateChecklist();
  const navigate = useNavigate();

  const handleFormSubmit = async (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist,
    questions: any[],
    file: File | null,
    aiPrompt: string,
    generateAIChecklist: (form: NewChecklist) => Promise<any>
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
      // Baseado na aba ativa, execute a função apropriada
      if (activeTab === "manual") {
        // Criação manual
        success = await submitManualChecklist(form, questions);
        console.log("Resultado da criação manual:", success);
      } 
      else if (activeTab === "import") {
        // Importação de planilha
        if (!file) {
          toast.error("Por favor, selecione um arquivo para importar");
          return false;
        }
        
        success = await submitImportChecklist(file, form);
        console.log("Resultado da importação:", success);
      } 
      else if (activeTab === "ai") {
        // Geração por IA
        if (!aiPrompt.trim()) {
          toast.error("Por favor, forneça um prompt para gerar o checklist");
          return false;
        }
        
        success = await submitAIChecklist(form, aiPrompt);
        console.log("Resultado da geração por IA:", success);
      }
      
      // Se chegou aqui, algo deu errado...
      else {
        console.error("Tab não reconhecida ou não implementada:", activeTab);
        toast.error("Operação não suportada");
        return false;
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
    handleFormSubmit
  };
}
