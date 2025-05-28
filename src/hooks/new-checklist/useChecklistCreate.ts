import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion, ChecklistGroup } from "@/types/checklist";
import { mapResponseType } from "@/utils/typeMapping";
import { handleApiError } from "@/utils/errorHandling";
import { validateBasicChecklist } from "@/validation/checklistValidation";
import { toast } from "sonner";

/**
 * Hook para criação de checklist
 * Usa o sistema centralizado de mapeamento de tipos e validação
 */
export function useChecklistCreate() {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    toast.success("Pergunta excluída");
  };

  /**
   * Salva o checklist no banco de dados
   * @returns Promise<boolean> Indica se o salvamento foi bem-sucedido
   */
  const handleSave = async (): Promise<boolean> => {
    // Valida os dados básicos
    if (!validateBasicChecklist(title, category, questions)) {
      return false;
    }

    setIsSubmitting(true);
    try {
      // Cria o checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          is_template: isTemplate,
          status_checklist: "ativo",
          origin: "manual"
        })
        .select("id")
        .single();

      if (checklistError) throw checklistError;

      const checklistId = checklistData.id;

      // Prepara as perguntas para inserção
      const questionInserts = questions.map((question, index) => {
        // Mapeia o tipo de resposta para o formato do banco de dados
        const dbResponseType = mapResponseType(question.responseType, "toDb");
        
        // Prepara opções para múltipla escolha
        const options = question.responseType === "seleção múltipla" 
          ? (Array.isArray(question.options) ? question.options : []) 
          : null;
          
        return {
          checklist_id: checklistId,
          pergunta: question.text,
          tipo_resposta: dbResponseType,
          obrigatorio: question.isRequired,
          ordem: index,
          weight: question.weight || 1,
          permite_foto: question.allowsPhoto || false,
          permite_video: question.allowsVideo || false,
          permite_audio: question.allowsAudio || false,
          permite_files: question.allowsFiles || false,
          hint: question.hint || null,
          opcoes: options
        };
      });

      // Insere as perguntas
      const { error: questionsError } = await supabase
        .from("checklist_itens")
        .insert(questionInserts);

      if (questionsError) throw questionsError;

      toast.success("Checklist criado com sucesso!");
      navigate("/new-checklists");
      return true;
    } catch (error: any) {
      handleApiError(error, "Erro ao criar checklist");
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
    isSubmitting,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleSave
  };
}
