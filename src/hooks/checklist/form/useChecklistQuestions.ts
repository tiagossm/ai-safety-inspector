
import { useState } from "react";

interface ChecklistQuestion {
  text: string;
  type: "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla" | "data";
  required: boolean;
  allowPhoto: boolean;
  allowVideo: boolean;
  allowAudio: boolean;
  options?: string[];
  hint?: string;
  weight?: number;
  parentId?: string;
  conditionValue?: string;
}

export function useChecklistQuestions() {
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([
    { 
      text: "", 
      type: "sim/não", 
      required: true, 
      allowPhoto: true, 
      allowVideo: false, 
      allowAudio: false,
      weight: 1,
      hint: ""
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { 
        text: "", 
        type: "sim/não", 
        required: true, 
        allowPhoto: true, 
        allowVideo: false, 
        allowAudio: false,
        weight: 1,
        hint: ""
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    // Atualize as referências parent após a remoção
    const updatedQuestions = newQuestions.map(q => {
      if (q.parentId && Number(q.parentId) >= index) {
        return { ...q, parentId: String(Number(q.parentId) - 1) };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof ChecklistQuestion,
    value: string | boolean | string[] | number
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const handleOptionAdd = (index: number, option: string) => {
    const newQuestions = [...questions];
    const currentOptions = newQuestions[index].options || [];
    newQuestions[index] = {
      ...newQuestions[index],
      options: [...currentOptions, option]
    };
    setQuestions(newQuestions);
  };

  const handleOptionRemove = (index: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const currentOptions = [...(newQuestions[index].options || [])];
    currentOptions.splice(optionIndex, 1);
    newQuestions[index] = {
      ...newQuestions[index],
      options: currentOptions
    };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (index: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    const currentOptions = [...(newQuestions[index].options || [])];
    currentOptions[optionIndex] = value;
    newQuestions[index] = {
      ...newQuestions[index],
      options: currentOptions
    };
    setQuestions(newQuestions);
  };

  return {
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleOptionAdd,
    handleOptionRemove,
    handleOptionChange
  };
}
