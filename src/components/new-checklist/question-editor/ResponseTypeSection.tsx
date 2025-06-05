
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import { StandardResponseType } from "@/types/responseTypes";

interface ResponseTypeSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function ResponseTypeSection({
  question,
  onUpdate
}: ResponseTypeSectionProps) {
  // Garantir que sempre temos um tipo válido
  const currentResponseType = question.responseType || "yes_no";
  
  const handleResponseTypeChange = (newType: StandardResponseType) => {
    console.log("Alterando tipo de resposta de", currentResponseType, "para", newType);
    
    // Criar um novo objeto para garantir que o React detecte a mudança
    const updatedQuestion: ChecklistQuestion = { 
      ...question, 
      responseType: newType 
    };
    
    // Se o novo tipo não requer opções, limpar as opções existentes
    if (!["multiple_choice", "checkboxes", "dropdown"].includes(newType)) {
      updatedQuestion.options = [];
    }
    // Se o novo tipo requer opções e não há opções, criar opções padrão
    else if (["multiple_choice", "checkboxes", "dropdown"].includes(newType) && 
             (!updatedQuestion.options || updatedQuestion.options.length === 0)) {
      updatedQuestion.options = ["Opção 1", "Opção 2"];
    }
    
    console.log("Pergunta atualizada:", updatedQuestion);
    onUpdate(updatedQuestion);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Tipo de resposta
      </label>
      <ResponseTypeSelector
        value={currentResponseType}
        onChange={handleResponseTypeChange}
        showDescriptions
      />
    </div>
  );
}
