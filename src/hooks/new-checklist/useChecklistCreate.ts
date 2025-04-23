
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";

const getDatabaseType = (type: string): string => {
  return frontendToDatabaseResponseType(type);
};

const getStatusChecklist = (status: string): string => {
  return status === 'active' ? 'ativo' : 'inativo';
};

interface CreateParams {
  checklist: NewChecklistPayload;
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
}

export function useChecklistCreate() {
  return useMutation({
    mutationFn: async (params: CreateParams) => {
      console.log("Creating new checklist:", params.checklist);
      
      if (!params.checklist.title) {
        throw new Error("Checklist title is required");
      }
      
      const status_checklist = getStatusChecklist(params.checklist.status || 'active');
      
      const company_id = params.checklist.company_id;
      
      const isAIGenerated = params.checklist.description?.toLowerCase().includes('gerado por ia') ||
                            params.checklist.description?.toLowerCase().includes('checklist gerado por ia') ||
                            params.checklist.description?.toLowerCase().includes('checklist: ');
      
      const isCSVImported = params.checklist.description?.toLowerCase().includes('importado via csv') ||
                           params.checklist.description?.toLowerCase().includes('importado de planilha') ||
                           params.checklist.description?.toLowerCase().includes('importado de excel');
      
      const origin = params.checklist.origin || (isAIGenerated ? 'ia' : (isCSVImported ? 'csv' : 'manual'));
      
      const { data: newChecklist, error: createError } = await supabase
        .from("checklists")
        .insert({
          title: params.checklist.title,
          description: params.checklist.description,
          status: params.checklist.status || "active",
          company_id: company_id,
          category: params.checklist.category,
          ...(params.checklist.origin && { origin: params.checklist.origin }),
          is_template: params.checklist.is_template || false,
          status_checklist: status_checklist,
          responsible_id: params.checklist.responsible_id,
          due_date: params.checklist.due_date
        })
        .select("id")
        .single();
        
      if (createError) {
        console.error("Error creating checklist:", createError);
        throw createError;
      }
      
      const checklistId = newChecklist.id;
      console.log("Created checklist with ID:", checklistId);
      
      if (params.questions && params.questions.length > 0) {
        const questionInserts = params.questions.map((question, index) => {
          let questionHint = question.hint || "";
          
          if (question.groupId && params.groups) {
            const group = params.groups.find(g => g.id === question.groupId);
            if (group) {
              questionHint = JSON.stringify({
                groupId: group.id,
                groupTitle: group.title,
                groupIndex: params.groups.indexOf(group)
              });
            }
          }
          
          let questionOptions: string[] = [];
          
          if (question.responseType === 'multiple_choice') {
            if (Array.isArray(question.options)) {
              questionOptions = question.options;
            } else if (typeof question.options === 'string') {
              try {
                const optionsStr: string = question.options;
                
                if (optionsStr.startsWith('[') && optionsStr.endsWith(']')) {
                  try {
                    const parsedOptions = JSON.parse(optionsStr);
                    if (Array.isArray(parsedOptions)) {
                      questionOptions = parsedOptions;
                    }
                  } catch (e) {
                    questionOptions = optionsStr.split(',').map(o => o.trim());
                  }
                } else {
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
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error in useChecklistCreate:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  });
}
