
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

// Convert UI friendly type to database type
const getDatabaseType = (type: ChecklistQuestion['responseType']): string => {
  const typeMap: Record<string, string> = {
    'yes_no': 'yes_no',
    'multiple_choice': 'multiple_choice',
    'text': 'text',
    'numeric': 'numeric',
    'photo': 'photo',
    'signature': 'signature'
  };
  
  return typeMap[type] || 'text';
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
      
      // Ensure required fields have values
      if (!checklist.title) {
        throw new Error("Checklist title is required");
      }
      
      // Fix the status_checklist value to match the database constraint
      // The database requires 'ativo' or 'inativo', not 'active' or 'inactive'
      const status_checklist = checklist.status === 'active' ? 'ativo' : 'inativo';
      
      // Insert the checklist
      const { data: newChecklist, error: createError } = await supabase
        .from("checklists")
        .insert({
          title: checklist.title,
          description: checklist.description,
          is_template: checklist.isTemplate || false,
          status_checklist: status_checklist, // Fixed value
          status: checklist.status || 'active', // Keep status field as is
          category: checklist.category,
          responsible_id: checklist.responsibleId,
          company_id: checklist.companyId,
          due_date: checklist.dueDate
        })
        .select("id")
        .single();
        
      if (createError) {
        console.error("Error creating checklist:", createError);
        throw createError;
      }
      
      const checklistId = newChecklist.id;
      console.log("Created checklist with ID:", checklistId);
      
      // If we have questions, insert them
      if (questions && questions.length > 0) {
        const questionInserts = questions.map((question, index) => {
          // For grouped questions, store group info in the hint field
          let questionHint = question.hint || "";
          
          if (question.groupId && groups) {
            const group = groups.find(g => g.id === question.groupId);
            if (group) {
              // Store group info as JSON in the hint field
              questionHint = JSON.stringify({
                groupId: group.id,
                groupTitle: group.title,
                groupIndex: groups.indexOf(group)
              });
            }
          }
          
          // Ensure options is an array when storing in the database
          let questionOptions: string[] = [];
          
          if (question.responseType === 'multiple_choice') {
            // Handle the options field which might be a string or an array
            if (Array.isArray(question.options)) {
              questionOptions = question.options;
            } else if (typeof question.options === 'string') {
              // If it's a string, attempt to parse it if it looks like JSON
              if (question.options.startsWith('[') && question.options.endsWith(']')) {
                try {
                  questionOptions = JSON.parse(question.options);
                } catch (e) {
                  // If parsing fails, split by commas
                  questionOptions = question.options.split(',').map(o => o.trim());
                }
              } else {
                // If not JSON format, split by commas
                questionOptions = question.options.split(',').map(o => o.trim());
              }
            }
          }
          
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
        
        const { error: questionsError } = await supabase
          .from("checklist_itens")
          .insert(questionInserts);
          
        if (questionsError) {
          console.error("Error adding questions:", questionsError);
          // Don't throw, continue with just the checklist
          toast.warning("Checklist criado, mas houve erro ao adicionar algumas perguntas.");
        }
      }
      
      return { id: checklistId };
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error in useChecklistCreate:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  });
}
