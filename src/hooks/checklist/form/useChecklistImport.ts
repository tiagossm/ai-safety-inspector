
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import Papa from "papaparse";

export type ChecklistImportResult = {
  success: boolean;
  message?: string;
  checklistId?: string;
  checklistData?: any;
  questions?: any[];
  mode?: string;
};

export function useChecklistImport() {
  const importMutation = useMutation({
    mutationFn: async (data: { file: File; form: NewChecklist }): Promise<ChecklistImportResult> => {
      const { file, form } = data;
      
      // Verificar se é CSV ou Excel e processar de acordo
      try {
        // Primeiro criar o checklist
        const { data: checklist, error: checklistError } = await supabase
          .from('checklists')
          .insert({
            title: form.title,
            description: form.description,
            is_template: form.is_template || false,
            status_checklist: form.status_checklist || 'ativo',
            category: form.category || 'geral',
            responsible_id: form.responsible_id,
            company_id: form.company_id,
          })
          .select()
          .single();
        
        if (checklistError) {
          console.error('Erro ao criar checklist:', checklistError);
          return { 
            success: false, 
            message: `Erro ao criar checklist: ${checklistError.message}` 
          };
        }
        
        // Agora processar o arquivo para extrair as perguntas
        return new Promise((resolve) => {
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            Papa.parse(file, {
              header: true,
              complete: async (results) => {
                try {
                  if (results.data.length === 0) {
                    return resolve({ 
                      success: false, 
                      message: 'O arquivo não contém dados' 
                    });
                  }
                  
                  // Mapear as perguntas do CSV para o formato esperado pelo backend
                  const questions = results.data.map((row: any, index: number) => ({
                    checklist_id: checklist.id,
                    pergunta: row.pergunta || row.Pergunta || row.question || row.Question || `Pergunta ${index + 1}`,
                    tipo_resposta: row.tipo_resposta || row.tipo || row.type || row.Type || 'sim/não',
                    obrigatorio: row.obrigatorio === 'sim' || row.obrigatorio === 'true' || row.required === 'true' || true,
                    opcoes: row.opcoes ? JSON.stringify(row.opcoes.split('|').map((opt: string) => opt.trim())) : null,
                    ordem: index,
                    permite_foto: row.permite_foto === 'sim' || row.permite_foto === 'true' || false,
                    permite_video: row.permite_video === 'sim' || row.permite_video === 'true' || false,
                    permite_audio: row.permite_audio === 'sim' || row.permite_audio === 'true' || false,
                  }));
                  
                  // Inserir as perguntas no banco
                  const { error: questionsError } = await supabase
                    .from('checklist_itens')
                    .insert(questions);
                  
                  if (questionsError) {
                    console.error('Erro ao criar perguntas:', questionsError);
                    return resolve({ 
                      success: false, 
                      message: `Erro ao criar perguntas: ${questionsError.message}` 
                    });
                  }
                  
                  return resolve({ 
                    success: true, 
                    checklistId: checklist.id,
                    checklistData: checklist,
                    questions: questions,
                    mode: 'import',
                    message: 'Checklist importado com sucesso!'
                  });
                } catch (error: any) {
                  console.error('Erro ao importar CSV:', error);
                  return resolve({ 
                    success: false, 
                    message: `Erro ao processar o arquivo: ${error.message}` 
                  });
                }
              },
              error: (error) => {
                console.error('Erro ao parsear CSV:', error);
                return resolve({ 
                  success: false, 
                  message: `Erro ao processar o arquivo CSV: ${error.message}` 
                });
              }
            });
          } else {
            // Para arquivos Excel, seria necessário usar outra biblioteca como xlsx
            return resolve({ 
              success: false, 
              message: 'Formato de arquivo não suportado. Por favor, use um arquivo CSV.' 
            });
          }
        });
      } catch (error: any) {
        console.error('Erro na importação:', error);
        return { 
          success: false, 
          message: `Erro durante a importação: ${error.message}` 
        };
      }
    }
  });

  return {
    importFromFile: (file: File, form: NewChecklist) => importMutation.mutateAsync({ file, form }),
    isImporting: importMutation.isPending
  };
}
