
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklist } from "@/types/checklist";
import Papa from "papaparse";

export function useChecklistImportSubmit() {
  const importChecklist = async (file: File, formData: NewChecklist): Promise<string | null> => {
    try {
      // Parse file content
      const questions = await parseFile(file);
      
      // Create the checklist
      const { data: checklist, error } = await supabase
        .from("checklists")
        .insert({
          title: formData.title || `Checklist importado de ${file.name}`,
          description: formData.description || `Importado via CSV: ${file.name}`,
          is_template: formData.is_template || false,
          status_checklist: formData.status_checklist || "ativo",
          category: formData.category || "general",
          responsible_id: formData.responsible_id,
          company_id: formData.company_id,
          origin: 'csv' // Set the origin to 'csv' for imported checklists
        })
        .select();

      if (error) {
        console.error("Error creating checklist:", error);
        throw error;
      }

      const checklistId = checklist[0].id;
      
      // Insert questions
      if (questions && questions.length > 0) {
        const questionItems = questions.map((question, index) => ({
          checklist_id: checklistId,
          pergunta: question.pergunta || question.question || question.Pergunta || question.Question || `Pergunta ${index + 1}`,
          tipo_resposta: question.tipo_resposta || question.type || question.Tipo || question.Type || "sim/não",
          obrigatorio: question.obrigatorio === "true" || question.obrigatorio === "sim" || true,
          ordem: index + 1
        }));
        
        const { error: questionError } = await supabase
          .from("checklist_itens")
          .insert(questionItems);
          
        if (questionError) {
          console.error("Error adding questions:", questionError);
          toast.warning("Checklist criado, mas houve erro ao adicionar algumas perguntas.");
        }
      }
      
      toast.success("Checklist importado com sucesso!");
      return checklistId;
    } catch (error) {
      console.error("Error importing checklist:", error);
      toast.error(`Erro ao importar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return null;
    }
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  return {
    importChecklist
  };
}
