
import { useState } from "react";

interface ChecklistQuestion {
  text: string;
  type: string;
  required: boolean;
  allowPhoto: boolean;
  allowVideo: boolean;
  allowAudio: boolean;
}

export function useChecklistQuestions() {
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([
    { text: "", type: "sim/não", required: true, allowPhoto: true, allowVideo: false, allowAudio: false }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", type: "sim/não", required: true, allowPhoto: true, allowVideo: false, allowAudio: false }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof ChecklistQuestion,
    value: string | boolean
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  return {
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange
  };
}
