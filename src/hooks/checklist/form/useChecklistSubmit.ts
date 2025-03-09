
import { useState } from "react";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChecklistAI } from "./useChecklistAI";
import { useChecklistImport } from "./useChecklistImport";

export function useChecklistSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createChecklist = useCreateChecklist();
  const { generateAIChecklist } = useChecklistAI();
  const { importFromFile } = useChecklistImport();

  const submitManualChecklist = async (
    form: NewChecklist, 
    questions: Array<{ text: string; type: string; required: boolean }>
  ) => {
    try {
      console.log("Submitting manual form:", form);
      const newChecklist = await createChecklist.mutateAsync(form);
      
      // Add questions to the created checklist
      if (newChecklist?.id && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (q.text.trim()) {
            await supabase
              .from("checklist_itens")
              .insert({
                checklist_id: newChecklist.id,
                pergunta: q.text,
                tipo_resposta: q.type,
                obrigatorio: q.required,
                ordem: i
              });
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in manual submission:", error);
      toast.error("Erro ao criar checklist. Tente novamente.");
      return false;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist,
    questions: Array<{ text: string; type: string; required: boolean }>,
    file: File | null,
    aiPrompt: string
  ) => {
    e.preventDefault();
    
    if (!form.title.trim() && activeTab !== "ai") {
      toast.error("O título é obrigatório");
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      if (activeTab === "manual") {
        return await submitManualChecklist(form, questions);
      } else if (activeTab === "import" && file) {
        return await importFromFile(file, form);
      } else if (activeTab === "ai") {
        const result = await generateAIChecklist(form);
        return !!result;
      }
      return false;
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Erro ao criar checklist. Tente novamente.");
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
