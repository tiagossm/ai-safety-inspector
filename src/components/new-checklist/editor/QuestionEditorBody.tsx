
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ResponseTypeSelector } from "./ResponseTypeSelector";
import { AdvancedOptionsEditor } from "./AdvancedOptionsEditor";

interface QuestionEditorBodyProps {
  question: ChecklistQuestion;
  onUpdate: (field: keyof ChecklistQuestion, value: any) => void;
  onOptionsChange: (options: string[]) => void;
}

export function QuestionEditorBody({
  question,
  onUpdate,
  onOptionsChange
}: QuestionEditorBodyProps) {
  return (
    <>
      {/* Configurações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Tipo de resposta</Label>
          <ResponseTypeSelector
            value={question.responseType}
            onChange={(type) => onUpdate("responseType", type)}
          />
        </div>
        
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Peso/Pontos</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={question.weight || 1}
            onChange={(e) => onUpdate("weight", Number(e.target.value))}
            className="h-9"
          />
        </div>
        
        <div className="flex items-center space-x-2 pt-4">
          <Switch
            id={`required-${question.id}`}
            checked={question.isRequired || false}
            onCheckedChange={(checked) => onUpdate("isRequired", checked)}
          />
          <Label htmlFor={`required-${question.id}`} className="text-xs text-gray-600">
            Obrigatório
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        {/* Editor de opções */}
        <AdvancedOptionsEditor
          options={question.options || []}
          onOptionsChange={onOptionsChange}
          questionId={question.id}
          responseType={question.responseType}
        />

        {/* Dica para o inspetor */}
        {question.hint !== undefined && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Dica para o inspetor
            </Label>
            <Input
              placeholder="Digite uma dica opcional que ajudará o inspetor..."
              value={question.hint || ""}
              onChange={(e) => onUpdate("hint", e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </div>
    </>
  );
}
