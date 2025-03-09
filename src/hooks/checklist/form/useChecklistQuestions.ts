
import { useState } from "react";

export function useChecklistQuestions() {
  const [questions, setQuestions] = useState<Array<{
    text: string,
    type: string,
    required: boolean
  }>>([{ text: "", type: "texto", required: true }]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", type: "texto", required: true }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  return {
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange
  };
}
