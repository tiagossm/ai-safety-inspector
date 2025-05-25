
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";
import { toast } from "sonner";

export function useChecklistCreate() {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    toast.success("Pergunta excluída");
  };

  const handleSave = async (): Promise<boolean> => {
    if (!title.trim()) {
      toast.error("Título é obrigatório");
      return false;
    }

    if (questions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta");
      return false;
    }

    setIsSubmitting(true);
    try {
      // Create checklist
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

      // Insert questions
      const questionInserts = questions.map((question, index) => ({
        checklist_id: checklistId,
        pergunta: question.text,
        tipo_resposta: frontendToDatabaseResponseType(question.responseType),
        obrigatorio: question.isRequired,
        ordem: index,
        weight: question.weight || 1,
        permite_foto: question.allowsPhoto || false,
        permite_video: question.allowsVideo || false,
        permite_audio: question.allowsAudio || false,
        permite_files: question.allowsFiles || false,
        hint: question.hint || null,
        opcoes: question.responseType === "seleção múltipla" ? question.options : null
      }));

      const { error: questionsError } = await supabase
        .from("checklist_itens")
        .insert(questionInserts);

      if (questionsError) throw questionsError;

      toast.success("Checklist criado com sucesso!");
      navigate("/new-checklists");
      return true;
    } catch (error: any) {
      console.error("Error creating checklist:", error);
      toast.error(`Erro ao criar checklist: ${error.message}`);
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
