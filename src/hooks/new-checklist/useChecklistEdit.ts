
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistById } from "./useChecklistById";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";
import { toast } from "sonner";

export function useChecklistEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checklist, loading, error } = useChecklistById(id);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);

  // Load checklist data when available
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

  const handleUpdateQuestion = (updatedQuestion: ChecklistQuestion) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    
    if (!questionId.startsWith('new-')) {
      setDeletedQuestionIds(prev => [...prev, questionId]);
    }
    
    toast.success("Pergunta excluída");
  };

  const handleSave = async (): Promise<boolean> => {
    if (!id || !title.trim()) {
      toast.error("Título é obrigatório");
      return false;
    }

    setIsSubmitting(true);
    try {
      // Update checklist
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

      // Delete removed questions
      if (deletedQuestionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("checklist_itens")
          .delete()
          .in("id", deletedQuestionIds);

        if (deleteError) throw deleteError;
      }

      // Update/insert questions
      for (const question of questions) {
        const questionData = {
          checklist_id: id,
          pergunta: question.text,
          tipo_resposta: frontendToDatabaseResponseType(question.responseType),
          obrigatorio: question.isRequired,
          ordem: question.order,
          weight: question.weight || 1,
          permite_foto: question.allowsPhoto || false,
          permite_video: question.allowsVideo || false,
          permite_audio: question.allowsAudio || false,
          permite_files: question.allowsFiles || false,
          hint: question.hint || null,
          opcoes: question.responseType === "seleção múltipla" ? question.options : null
        };

        if (question.id.startsWith('new-')) {
          // Insert new question
          const { error: insertError } = await supabase
            .from("checklist_itens")
            .insert(questionData);

          if (insertError) throw insertError;
        } else {
          // Update existing question
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
      console.error("Error updating checklist:", error);
      toast.error(`Erro ao atualizar checklist: ${error.message}`);
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
