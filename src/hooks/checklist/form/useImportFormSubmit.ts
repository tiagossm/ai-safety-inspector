
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useImportFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitImportForm = async (
    form: NewChecklist,
    questions: any[]
  ): Promise<boolean> => {
    if (isSubmitting) {
      console.warn("Já existe uma submissão em andamento...");
      return false;
    }

    if (!form.title) {
      toast.error("O título do checklist é obrigatório");
      return false;
    }

    if (!questions || questions.length === 0) {
      toast.error("É necessário importar pelo menos uma pergunta");
      return false;
    }

    setIsSubmitting(true);

    try {
      console.log("Criando checklist com dados:", form);
      console.log("Perguntas a serem criadas:", questions);

      // Criar o checklist
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .insert({
          title: form.title,
          description: form.description || null,
          is_template: form.is_template || false,
          status_checklist: form.status_checklist || 'ativo',
          category: form.category || 'geral',
          responsible_id: form.responsible_id || null,
          company_id: form.company_id || null,
          origin: 'csv' // Marca como criado via importação CSV
        })
        .select()
        .single();

      if (checklistError) {
        console.error('Erro ao criar checklist:', checklistError);
        toast.error(`Erro ao criar checklist: ${checklistError.message}`);
        return false;
      }

      console.log("Checklist criado com sucesso:", checklist);

      // Criar as perguntas
      const questionItems = questions.map((question, index) => ({
        checklist_id: checklist.id,
        pergunta: question.pergunta,
        tipo_resposta: question.tipo_resposta,
        obrigatorio: question.obrigatorio,
        opcoes: question.opcoes ? JSON.stringify(question.opcoes) : null,
        ordem: index + 1,
      }));

      const { error: questionsError } = await supabase
        .from('checklist_itens')
        .insert(questionItems);

      if (questionsError) {
        console.error('Erro ao criar perguntas:', questionsError);
        toast.error(`Erro ao criar perguntas: ${questionsError.message}`);
        
        // Tentar remover o checklist criado se falhou ao criar as perguntas
        await supabase.from('checklists').delete().eq('id', checklist.id);
        return false;
      }

      console.log("Perguntas criadas com sucesso");
      toast.success(`Checklist "${form.title}" criado com sucesso! ${questions.length} perguntas importadas.`);
      
      // Navegar para a página do checklist criado
      navigate(`/new-checklists/${checklist.id}`);
      return true;

    } catch (error) {
      console.error("Erro ao processar formulário:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitImportForm,
    isSubmitting
  };
}
