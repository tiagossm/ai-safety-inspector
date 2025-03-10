
import { useState } from "react";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChecklistAI } from "./useChecklistAI";
import { useChecklistImport } from "./useChecklistImport";
import { useNavigate } from "react-router-dom";

export function useChecklistSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createChecklist = useCreateChecklist();
  const { generateAIChecklist } = useChecklistAI();
  const { importFromFile } = useChecklistImport();
  const navigate = useNavigate();

  const submitManualChecklist = async (
    form: NewChecklist, 
    questions: Array<{ text: string; type: string; required: boolean }>
  ) => {
    try {
      console.log("Submitting manual form:", form);
      const newChecklist = await createChecklist.mutateAsync(form);
      
      if (!newChecklist?.id) {
        console.error("No checklist ID was returned");
        throw new Error("Erro ao criar checklist: ID não foi gerado");
      }
      
      // Add questions to the created checklist
      if (questions.length > 0) {
        console.log(`Adding ${questions.length} questions to checklist ${newChecklist.id}`);
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
      
      // Redirect to the newly created checklist details page
      navigate(`/checklists/${newChecklist.id}`);
      
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
    let success = false;
    let checklistId: string | null = null;
    
    try {
      console.log(`Processing submission for ${activeTab} tab`);
      
      if (activeTab === "manual") {
        success = await submitManualChecklist(form, questions);
        // Note: Navigation is handled inside submitManualChecklist
        return success;
      } 
      else if (activeTab === "import" && file) {
        console.log("Processing file import");
        const importResult = await importFromFile(file, form);
        
        if (importResult && typeof importResult === 'object') {
          success = true;
          
          // Handle different possible response structures
          if ('id' in importResult) {
            checklistId = importResult.id as string;
          } else if ('checklist_id' in importResult) {
            checklistId = importResult.checklist_id as string;
          }
        } else {
          success = false;
          console.error("Import failed or returned invalid result", importResult);
        }
      } 
      else if (activeTab === "ai") {
        console.log("Processing AI generation");
        const aiResult = await generateAIChecklist(form);
        
        if (aiResult && typeof aiResult === 'object') {
          success = true;
          
          // Handle different possible response structures
          if ('id' in aiResult) {
            checklistId = aiResult.id as string;
          } else if ('data' in aiResult && typeof aiResult.data === 'object') {
            const resultData = aiResult.data as Record<string, any>;
            if (resultData && 'checklist_id' in resultData) {
              checklistId = resultData.checklist_id as string;
            }
          }
          
          if (!checklistId) {
            console.error("AI generation succeeded but no checklist ID was found in the response", aiResult);
          }
        } else {
          success = false;
          console.error("AI generation failed or returned invalid result", aiResult);
        }
      } else {
        console.error(`Invalid tab selected: ${activeTab}`);
        toast.error("Opção de criação inválida");
        success = false;
      }
      
      if (success) {
        toast.success("Checklist criado com sucesso!");
        
        // Navigate to the details page if we have an ID and haven't already navigated
        if (checklistId && activeTab !== "manual") {
          console.log(`Redirecting to checklist details: /checklists/${checklistId}`);
          navigate(`/checklists/${checklistId}`);
        } else if (!checklistId && activeTab !== "manual" && success) {
          console.log("Success but no ID returned, redirecting to main checklists page");
          navigate('/checklists');
          toast.info("Checklist criado, mas não foi possível abrir automaticamente.");
        }
      } else {
        toast.error("Erro ao criar checklist. Verifique os dados e tente novamente.");
      }
      
      return success;
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
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
