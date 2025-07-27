
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";

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
          id: (group.id.startsWith('new-') || group.id.startsWith('group-')) ? undefined : group.id,
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

      // Separate new questions from existing ones
      const newQuestions = questions.filter(q => q.id.startsWith('new-'));
      const existingQuestions = questions.filter(q => !q.id.startsWith('new-'));

      console.log(`Processando ${newQuestions.length} novas perguntas e ${existingQuestions.length} perguntas existentes`);

      // Process new questions (INSERT)
      if (newQuestions.length > 0) {
        const newQuestionsData = newQuestions.map((question, index) => {
          // Validate question data
          if (!question.text || !question.text.trim()) {
            throw new Error(`Nova pergunta ${index + 1} não possui texto válido`);
          }

          const questionData = {
            checklist_id: checklistId,
            pergunta: question.text.trim(),
            tipo_resposta: frontendToDatabaseResponseType(question.responseType),
            obrigatorio: question.isRequired,
            ordem: question.order !== undefined ? question.order : index,
            opcoes: question.options && question.options.length > 0 ? JSON.stringify(question.options) : null,
            weight: question.weight || 1,
            permite_foto: question.allowsPhoto || false,
            permite_video: question.allowsVideo || false,
            permite_audio: question.allowsAudio || false,
            permite_files: question.allowsFiles || false,
            hint: question.hint || null
          };

          console.log(`Inserindo nova pergunta ${index + 1}:`, questionData);
          return questionData;
        });

        const { error: newQuestionsError } = await supabase
          .from('checklist_itens')
          .insert(newQuestionsData);

        if (newQuestionsError) {
          console.error('Erro ao inserir novas perguntas:', newQuestionsError);
          throw newQuestionsError;
        }
      }

      // Process existing questions (UPDATE)
      if (existingQuestions.length > 0) {
        for (const question of existingQuestions) {
          // Validate existing question ID
          if (!question.id || question.id === 'undefined' || question.id.includes('undefined')) {
            console.error('ID inválido detectado:', question.id, 'para pergunta:', question.text);
            throw new Error(`Pergunta "${question.text}" possui ID inválido: ${question.id}`);
          }

          if (!question.text || !question.text.trim()) {
            throw new Error(`Pergunta existente "${question.id}" não possui texto válido`);
          }

          const updateData = {
            pergunta: question.text.trim(),
            tipo_resposta: frontendToDatabaseResponseType(question.responseType),
            obrigatorio: question.isRequired,
            ordem: question.order,
            opcoes: question.options && question.options.length > 0 ? JSON.stringify(question.options) : null,
            weight: question.weight || 1,
            permite_foto: question.allowsPhoto || false,
            permite_video: question.allowsVideo || false,
            permite_audio: question.allowsAudio || false,
            permite_files: question.allowsFiles || false,
            hint: question.hint || null
          };

          console.log(`Atualizando pergunta existente ${question.id}:`, updateData);

          const { error: updateError } = await supabase
            .from('checklist_itens')
            .update(updateData)
            .eq('id', question.id);

          if (updateError) {
            console.error(`Erro ao atualizar pergunta ${question.id}:`, updateError);
            throw updateError;
          }
        }
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
