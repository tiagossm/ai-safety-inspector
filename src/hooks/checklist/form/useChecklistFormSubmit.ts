
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
  ) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.warn("Já existe uma submissão em andamento...");
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Processando formulário...", { activeTab, form });
      
      // Baseado na aba ativa, execute a função apropriada
      if (activeTab === "manual") {
        // Criação manual
        const success = await submitManualChecklist(form, questions);
        console.log("Resultado da criação manual:", success);
        setIsSubmitting(false);
        return success;
      } 
      else if (activeTab === "import") {
        // Importação de planilha
        if (!file) {
          toast.error("Por favor, selecione um arquivo para importar");
          setIsSubmitting(false);
          return false;
        }
        
        const success = await submitImportChecklist(file, form);
        console.log("Resultado da importação:", success);
        setIsSubmitting(false);
        return success;
      } 
      else if (activeTab === "ai") {
        // Geração por IA
        if (!aiPrompt.trim()) {
          toast.error("Por favor, forneça um prompt para gerar o checklist");
          setIsSubmitting(false);
          return false;
        }
        
        const success = await submitAIChecklist(form, aiPrompt);
        console.log("Resultado da geração por IA:", success);
        setIsSubmitting(false);
        return success;
      }
      
      // Se chegou aqui, algo deu errado...
      console.error("Tab não reconhecida ou não implementada:", activeTab);
      toast.error("Operação não suportada");
      setIsSubmitting(false);
      return false;
    } catch (error) {
      console.error("Erro ao processar formulário:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    isSubmitting,
    handleFormSubmit
  };
}
