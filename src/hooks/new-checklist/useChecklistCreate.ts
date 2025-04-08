
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

const getDatabaseType = (type: ChecklistQuestion['responseType']): string => {
  const typeMap: Record<string, string> = {
    'yes_no': 'sim/não',
    'multiple_choice': 'seleção múltipla',
    'text': 'texto',
    'numeric': 'numérico',
    'photo': 'foto',
    'signature': 'assinatura',
    'sim/não': 'sim/não',
    'seleção múltipla': 'seleção múltipla',
    'texto': 'texto',
    'numérico': 'numérico',
    'foto': 'foto',
    'assinatura': 'assinatura'
  };
  
  console.log("Converting response type:", type, "to:", typeMap[type] || 'texto');
  return typeMap[type] || 'texto';
};

const getStatusChecklist = (status: string): string => {
  return status === 'active' ? 'ativo' : 'inativo';
};

export function useChecklistCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      checklist, 
      questions, 
      groups 
    }: { 
      checklist: NewChecklistPayload; 
      questions?: ChecklistQuestion[];
      groups?: ChecklistGroup[];
    }) => {
      console.log("Creating new checklist:", checklist);
      
      if (!checklist.title) {
        throw new Error("Checklist title is required");
      }
      
      const status_checklist = getStatusChecklist(checklist.status || 'active');
      
      const company_id = checklist.companyId || checklist.company_id;
      
      const isAIGenerated = checklist.description?.toLowerCase().includes('gerado por ia') ||
                            checklist.description?.toLowerCase().includes('checklist gerado por ia') ||
                            checklist.description?.toLowerCase().includes('checklist: ');
      
      const isCSVImported = checklist.description?.toLowerCase().includes('importado via csv') ||
                           checklist.description?.toLowerCase().includes('importado de planilha') ||
                           checklist.description?.toLowerCase().includes('importado de excel');
      
      const origin = checklist.origin || (isAIGenerated ? 'ia' : (isCSVImported ? 'csv' : 'manual'));
      
      const { data: newChecklist, error: createError } = await supabase
        .from("checklists")
        .insert({
          title: checklist.title,
          description: checklist.description,
          is_template: checklist.isTemplate || false,
          status_checklist: status_checklist,
          status: checklist.status || 'active',
          category: checklist.category,
          responsible_id: checklist.responsibleId,
          company_id: company_id,
          due_date: checklist.dueDate,
          created_by: isAIGenerated ? 'ai' : undefined,
          origin: origin
        })
        .select("id")
        .single();
        
      if (createError) {
        console.error("Error creating checklist:", createError);
        throw createError;
      }
      
      const checklistId = newChecklist.id;
      console.log("Created checklist with ID:", checklistId);
      
      if (questions && questions.length > 0) {
        const questionInserts = questions.map((question, index) => {
          let questionHint = question.hint || "";
          
          if (question.groupId && groups) {
            const group = groups.find(g => g.id === question.groupId);
            if (group) {
              questionHint = JSON.stringify({
                groupId: group.id,
                groupTitle: group.title,
                groupIndex: groups.indexOf(group)
              });
            }
          }
          
          let questionOptions: string[] = [];
          
          if (question.responseType === 'multiple_choice') {
            if (Array.isArray(question.options)) {
              questionOptions = question.options;
            } else if (typeof question.options === 'string') {
              try {
                // Create a local variable for the options string to ensure proper typing
                const optionsStr: string = question.options;
                
                if (optionsStr.startsWith('[') && optionsStr.endsWith(']')) {
                  try {
                    const parsedOptions = JSON.parse(optionsStr);
                    if (Array.isArray(parsedOptions)) {
                      questionOptions = parsedOptions;
                    }
                  } catch (e) {
                    // If JSON parsing fails, treat as comma-separated list
                    questionOptions = optionsStr.split(',').map(o => o.trim());
                  }
                } else {
                  // Treat as comma-separated list
                  questionOptions = optionsStr.split(',').map(o => o.trim());
                }
              } catch (e) {
                console.error("Error parsing options:", e);
              }
            }
          }
          
          console.log(`Preparing question ${index} for checklist ${checklistId}: ${question.text}, type: ${question.responseType} -> ${getDatabaseType(question.responseType)}`);
          
          return {
            checklist_id: checklistId,
            pergunta: question.text,
            tipo_resposta: getDatabaseType(question.responseType),
            obrigatorio: question.isRequired,
            opcoes: questionOptions,
            hint: questionHint,
            weight: question.weight || 1,
            parent_item_id: question.parentQuestionId,
            condition_value: question.conditionValue,
            permite_foto: question.allowsPhoto || false,
            permite_video: question.allowsVideo || false,
            permite_audio: question.allowsAudio || false,
            ordem: question.order || index
          };
        });
        
        console.log("Sample question data:", questionInserts.slice(0, 2));
        
        const { error: questionsError } = await supabase
          .from("checklist_itens")
          .insert(questionInserts);
          
        if (questionsError) {
          console.error("Error adding questions:", questionsError);
          toast.warning("Checklist criado, mas houve erro ao adicionar algumas perguntas.");
        }
      }
      
      return { id: checklistId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error in useChecklistCreate:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  });
}
