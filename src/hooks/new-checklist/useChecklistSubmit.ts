
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

export function useChecklistSubmit(
  id: string | undefined,
  title: string,
  description: string,
  category: string,
  isTemplate: boolean,
  status: "active" | "inactive",
  questions: ChecklistQuestion[],
  groups: ChecklistGroup[],
  deletedQuestionIds: string[],
  companyId?: string,
  responsibleId?: string,
  dueDate?: string
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (isSubmitting) return false;
    
    setIsSubmitting(true);
    
    try {
      if (!title.trim()) {
        toast.error("O título é obrigatório");
        return false;
      }

      if (questions.length === 0) {
        toast.error("É necessário pelo menos uma pergunta");
        return false;
      }

      console.log("Salvando checklist...", {
        id,
        title,
        description,
        category,
        isTemplate,
        status,
        companyId,
        responsibleId,
        dueDate,
        questionsCount: questions.length,
        groupsCount: groups.length
      });

      // Prepare checklist data
      const checklistData = {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        is_template: isTemplate,
        status_checklist: status === "active" ? "ativo" : "inativo",
        company_id: companyId || null,
        responsible_id: responsibleId || null,
        due_date: dueDate || null,
        updated_at: new Date().toISOString()
      };

      let checklistId = id;

      if (id) {
        // Update existing checklist
        const { error: updateError } = await supabase
          .from('checklists')
          .update(checklistData)
          .eq('id', id);

        if (updateError) {
          console.error('Erro ao atualizar checklist:', updateError);
          throw updateError;
        }
      } else {
        // Create new checklist
        const { data: newChecklist, error: createError } = await supabase
          .from('checklists')
          .insert({
            ...checklistData,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar checklist:', createError);
          throw createError;
        }

        checklistId = newChecklist.id;
      }

      // Handle deleted questions
      if (deletedQuestionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('checklist_itens')
          .delete()
          .in('id', deletedQuestionIds.filter(id => !id.startsWith('new-')));

        if (deleteError) {
          console.error('Erro ao deletar perguntas:', deleteError);
        }
      }

      // Update/create groups
      if (groups.length > 0) {
        // Delete existing groups that are not in the current list
        await supabase
          .from('checklist_groups')
          .delete()
          .eq('checklist_id', checklistId)
          .not('id', 'in', `(${groups.map(g => `'${g.id}'`).join(',')})`);

        // Upsert groups
        const groupsData = groups.map(group => ({
          id: group.id.startsWith('new-') ? undefined : group.id,
          checklist_id: checklistId,
          title: group.title,
          order: group.order
        }));

        const { error: groupsError } = await supabase
          .from('checklist_groups')
          .upsert(groupsData, { onConflict: 'id' });

        if (groupsError) {
          console.error('Erro ao salvar grupos:', groupsError);
          throw groupsError;
        }
      }

      // Prepare questions data
      const questionsData = questions.map((question, index) => {
        const questionData = {
          id: question.id.startsWith('new-') || question.id.startsWith('ai-generated-') || question.id.startsWith('csv-imported-') ? undefined : question.id,
          checklist_id: checklistId,
          pergunta: question.text,
          tipo_resposta: question.responseType === "yes_no" ? "sim/não" :
                        question.responseType === "text" ? "texto" :
                        question.responseType === "numeric" ? "numérico" :
                        question.responseType === "multiple_choice" ? "seleção múltipla" :
                        question.responseType === "photo" ? "foto" :
                        question.responseType === "signature" ? "assinatura" :
                        question.responseType === "time" ? "time" :
                        question.responseType === "date" ? "date" :
                        "sim/não",
          obrigatorio: question.isRequired,
          ordem: question.order || index,
          opcoes: question.options && question.options.length > 0 ? JSON.stringify(question.options) : null,
          weight: question.weight || 1,
          permite_foto: question.allowsPhoto || false,
          permite_video: question.allowsVideo || false,
          permite_audio: question.allowsAudio || false,
          permite_files: question.allowsFiles || false,
          hint: question.hint || null
        };

        console.log(`Preparando pergunta ${index + 1}:`, questionData);
        return questionData;
      });

      // Save questions
      const { error: questionsError } = await supabase
        .from('checklist_itens')
        .upsert(questionsData, { onConflict: 'id' });

      if (questionsError) {
        console.error('Erro ao salvar perguntas:', questionsError);
        throw questionsError;
      }

      console.log('Checklist salvo com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast.error(`Erro ao salvar checklist: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    id, title, description, category, isTemplate, status, 
    questions, groups, deletedQuestionIds, companyId, responsibleId, dueDate,
    isSubmitting
  ]);

  return {
    handleSubmit,
    isSubmitting
  };
}
