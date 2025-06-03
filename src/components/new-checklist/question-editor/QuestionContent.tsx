
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ResponseTypeSection } from "./ResponseTypeSection";
import { MediaSection } from "./MediaSection";
import { OptionsSection } from "./OptionsSection";
import { HintSection } from "./HintSection";

interface QuestionContentProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  enableAllMedia?: boolean;
}

export function QuestionContent({ question, onUpdate, enableAllMedia }: QuestionContentProps) {
  const handleFieldUpdate = (field: keyof ChecklistQuestion, value: any) => {
    const updatedQuestion = { ...question, [field]: value };
    onUpdate(updatedQuestion);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Texto da pergunta */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Texto da pergunta
        </label>
        <Textarea
          placeholder="Digite o texto da pergunta"
          value={question.text || ""}
          onChange={(e) => handleFieldUpdate("text", e.target.value)}
          className="w-full"
          rows={2}
        />
      </div>

      {/* Grid com configurações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo de resposta */}
        <div>
          <ResponseTypeSection 
            question={question}
            onUpdate={onUpdate}
          />
        </div>

        {/* Peso/Pontos */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Peso/Pontos
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={question.weight || 1}
            onChange={(e) => handleFieldUpdate("weight", Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Obrigatório */}
        <div className="flex items-center space-x-2">
          <Switch
            id={`required-${question.id}`}
            checked={question.isRequired || false}
            onCheckedChange={(checked) => handleFieldUpdate("isRequired", checked)}
          />
          <label htmlFor={`required-${question.id}`} className="text-sm font-medium text-gray-700">
            Obrigatório
          </label>
        </div>
      </div>

      {/* Opções (se necessário) */}
      <OptionsSection 
        question={question}
        onUpdate={onUpdate}
      />

      {/* Dica */}
      <HintSection 
        question={question}
        onUpdate={onUpdate}
      />

      {/* Opções de mídia */}
      <MediaSection 
        question={question}
        onUpdate={onUpdate}
        enableAllMedia={enableAllMedia}
      />
    </div>
  );
}
