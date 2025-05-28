import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion, ChecklistGroup } from "@/types/checklist";
import { useChecklistById } from "./useChecklistById";
import { mapResponseType } from "@/utils/typeMapping";
import { handleApiError } from "@/utils/errorHandling";
import { validateBasicChecklist } from "@/validation/checklistValidation";
import { toast } from "sonner";

/**
 * Hook para edição de checklist
 * Usa o sistema centralizado de mapeamento de tipos e validação
 */
export function useChecklistEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checklist, loading, error, refetch } = useChecklistById(id);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);

  // Carrega os dados do checklist quando disponíveis
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title);
      setDescription(checklist.description);
      setCategory(checklist.category);
      setIsTemplate(checklist.isTemplate);
      setQuestions(checklist.questions || []);
      setGroups(checklist.groups || []);
    }
  }, [checklist]);

  /**
   * Adiciona uma nova pergunta ao checklist
   * @param groupId ID do grupo ao qual a pergunta pertence
   */
  const handleAddQuestion = (groupId: string) => {
    const newQuestion: ChecklistQuestion = {
      id: `new-${Date.now()}`,
      text: "",
      responseType: "sim/não",
      isRequired: true,
      order: questions.length,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      groupId
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    toast.success("Pergunta adicionada");
  };

  /**
   * Atualiza uma pergunta existente
   * @param updatedQuestion Pergunta atualizada
   */
  const handleUpdateQuestion = (updatedQuestion: ChecklistQuestion) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
  };

  /**
   * Remove uma pergunta do checklist
   * @param questionId ID da pergunta a ser removida
   */
  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    
    // Se não for uma pergunta nova, adiciona à lista de perguntas excluídas
    if (!questionId.startsWith('new-')) {
      setDeletedQuestionIds(prev => [...prev, questionId]);
    }
    
    toast.success("Pergunta excluída");
  };

  /**
   * Salva as alterações no checklist
   * @returns Promise<boolean> Indica se o salvamento foi bem-sucedido
   */
  const handleSave = async (): Promise<boolean> => {
    if (!id) {
      toast.error("ID do checklist não encontrado");
      return false;
    }
    
    // Valida os dados básicos
    if (!validateBasicChecklist(title, category, questions)) {
      return false;
    }

    setIsSubmitting(true);
    try {
      // Atualiza os dados básicos do checklist
      const { error: checklistError } = await supabase
        .from("checklists")
        .update({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          is_template: isTemplate,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (checklistError) throw checklistError;

      // Exclui perguntas removidas
      if (deletedQuestionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("checklist_itens")
          .delete()
          .in("id", deletedQuestionIds);

        if (deleteError) throw deleteError;
      }

      // Atualiza/insere perguntas
      for (const question of questions) {
        // Mapeia o tipo de resposta para o formato do banco de dados
        const dbResponseType = mapResponseType(question.responseType, "toDb");
        
        // Prepara opções para múltipla escolha
        const options = question.responseType === "seleção múltipla" 
          ? (Array.isArray(question.options) ? question.options : []) 
          : null;
          
        const questionData = {
          checklist_id: id,
          pergunta: question.text,
          tipo_resposta: dbResponseType,
          obrigatorio: question.isRequired,
          ordem: question.order,
          weight: question.weight || 1,
          permite_foto: question.allowsPhoto || false,
          permite_video: question.allowsVideo || false,
          permite_audio: question.allowsAudio || false,
          permite_files: question.allowsFiles || false,
          hint: question.hint || null,
          opcoes: options
        };

        if (question.id.startsWith('new-')) {
          // Insere nova pergunta
          const { error: insertError } = await supabase
            .from("checklist_itens")
            .insert(questionData);

          if (insertError) throw insertError;
        } else {
          // Atualiza pergunta existente
          const { error: updateError } = await supabase
            .from("checklist_itens")
            .update(questionData)
            .eq("id", question.id);

          if (updateError) throw updateError;
        }
      }

      toast.success("Checklist atualizado com sucesso!");
      navigate("/new-checklists");
      return true;
    } catch (error: any) {
      handleApiError(error, "Erro ao atualizar checklist");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    isTemplate,
    setIsTemplate,
    questions,
    setQuestions,
    groups,
    setGroups,
    loading,
    error,
    isSubmitting,
    deletedQuestionIds,
    setDeletedQuestionIds,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleSave
  };
}
