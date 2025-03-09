
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { toast } from "sonner";

export function useChecklistAI() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const createChecklist = useCreateChecklist();

  const generateAIChecklist = async (form: NewChecklist) => {
    if (!aiPrompt) {
      toast.error("Por favor, informe um prompt para a IA");
      return null;
    }
    
    setAiLoading(true);
    
    try {
      console.log("Generating checklist with AI using prompt:", aiPrompt);
      
      // Call the edge function to generate the checklist
      const { data, error } = await supabase.functions.invoke("generate-checklist", {
        body: { 
          prompt: aiPrompt,
          num_questions: numQuestions,
          category: form.category
        }
      });
      
      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Nenhum dado retornado pela função de IA");
      }
      
      console.log("AI response:", data);
      
      if (data?.success && data?.data) {
        console.log("AI generated checklist data:", data.data);
        
        // Update the form with generated data
        const updatedForm = {
          ...form,
          title: data.data.title || `Checklist AI: ${aiPrompt.substring(0, 30)}...`,
          description: data.data.description || `Checklist gerado automaticamente baseado em: ${aiPrompt}`
        };
        
        // Create the checklist
        const newChecklist = await createChecklist.mutateAsync(updatedForm);
        
        if (!newChecklist?.id) {
          throw new Error("Falha ao criar checklist: ID não foi gerado");
        }
        
        // If questions were generated, add them to the checklist
        if (data.data.questions && data.data.questions.length > 0) {
          console.log("Adding AI generated questions to checklist:", newChecklist.id);
          
          for (const question of data.data.questions) {
            await supabase
              .from("checklist_itens")
              .insert({
                checklist_id: newChecklist.id,
                pergunta: question.pergunta,
                tipo_resposta: question.tipo_resposta || "sim/não",
                obrigatorio: question.obrigatorio !== undefined ? question.obrigatorio : true,
                ordem: question.ordem || 0
              });
          }
          
          toast.success(`Checklist criado com ${data.data.questions.length} perguntas`);
        }
        
        return newChecklist;
      } else {
        toast.error("Erro ao gerar checklist com IA");
        return null;
      }
    } catch (error) {
      console.error("Error generating AI checklist:", error);
      toast.error(`Erro ao gerar checklist com IA: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  return {
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    aiLoading,
    generateAIChecklist
  };
}
