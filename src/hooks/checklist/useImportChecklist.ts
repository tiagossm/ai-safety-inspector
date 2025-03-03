
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import Papa from "papaparse";

export function useImportChecklist() {
  const queryClient = useQueryClient();
  
  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (file.type === "text/csv") {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      } else if (file.type.includes("excel") || file.type.includes("spreadsheetml")) {
        // Para arquivos Excel, precisamos usar uma biblioteca como SheetJS (xlsx)
        // Esta é uma implementação simplificada
        toast.error("Importação de Excel ainda não implementada");
        reject(new Error("Excel import not implemented"));
      } else {
        reject(new Error("Formato de arquivo não suportado"));
      }
    });
  };

  return useMutation({
    mutationFn: async ({ file, checklistData }: { file: File, checklistData: NewChecklist }) => {
      try {
        // Primeiro, criamos o checklist
        const { data: checklist, error: checklistError } = await supabase
          .from("checklists")
          .insert({
            title: checklistData.title,
            description: checklistData.description,
            is_template: checklistData.is_template || false,
            status_checklist: "ativo",
            category: checklistData.category || "general",
            responsible_id: checklistData.responsible_id,
            company_id: checklistData.company_id
          })
          .select();

        if (checklistError) {
          throw checklistError;
        }

        const createdChecklist = checklist[0];

        // Agora, parseamos o arquivo e inserimos as perguntas
        const questions = await parseFile(file);

        // Validamos as perguntas
        if (!questions || questions.length === 0) {
          throw new Error("Nenhuma pergunta encontrada no arquivo");
        }

        // Criamos um array de perguntas formatado para inserção
        const items = questions.map((q, index) => ({
          checklist_id: createdChecklist.id,
          pergunta: q.pergunta || q.question || q.Pergunta || q.Question || `Pergunta ${index + 1}`,
          tipo_resposta: q.tipo_resposta || q.type || q.Tipo || q.Type || "sim/não",
          obrigatorio: q.obrigatorio === "true" || q.obrigatorio === "sim" || true,
          ordem: index + 1,
          opcoes: q.opcoes ? JSON.stringify(q.opcoes.split(",").map(o => o.trim())) : null
        }));

        // Inserimos as perguntas
        const { error: itemsError } = await supabase
          .from("checklist_itens")
          .insert(items);

        if (itemsError) {
          throw itemsError;
        }

        return createdChecklist;
      } catch (error) {
        console.error("Erro ao importar checklist:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist importado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao importar checklist:", error);
      toast.error("Erro ao importar checklist. Verifique o formato do arquivo.");
    }
  });
}
