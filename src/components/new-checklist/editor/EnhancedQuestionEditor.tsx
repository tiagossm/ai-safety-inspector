
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import { StandardResponseType, TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";
import { MediaOptionsToggle } from "./MediaOptionsToggle";
import { AdvancedOptionsEditor } from "./AdvancedOptionsEditor";

interface EnhancedQuestionEditorProps {
  question: ChecklistQuestion;
  questionIndex: number;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function EnhancedQuestionEditor({
  question,
  questionIndex,
  onUpdate,
  onDelete,
  isDragging = false
}: EnhancedQuestionEditorProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(question.responseType);

  const handleUpdate = (field: keyof ChecklistQuestion, value: any) => {
    const updatedQuestion = { ...question, [field]: value };
    
    // Limpar opções se o tipo não exigir
    if (field === 'responseType' && !TYPES_REQUIRING_OPTIONS.includes(value as StandardResponseType)) {
      updatedQuestion.options = [];
    }
    
    onUpdate(updatedQuestion);
  };

  const handleOptionsUpdate = (newOptions: string[]) => {
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <Card className={`transition-all duration-200 ${isDragging ? 'opacity-50 rotate-1' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600">
              Pergunta {questionIndex + 1}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Texto da pergunta */}
        <div>
          <Label htmlFor={`question-text-${question.id}`}>Texto da pergunta</Label>
          <Textarea
            id={`question-text-${question.id}`}
            placeholder="Digite sua pergunta aqui..."
            value={question.text}
            onChange={(e) => handleUpdate('text', e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>

        {/* Grid de configurações principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Tipo de resposta</Label>
            <ResponseTypeSelector
              value={question.responseType}
              onChange={(type) => handleUpdate('responseType', type)}
              showDescriptions={false}
            />
          </div>

          <div>
            <Label htmlFor={`weight-${question.id}`}>Peso/Pontos</Label>
            <Input
              id={`weight-${question.id}`}
              type="number"
              min="0"
              max="100"
              value={question.weight}
              onChange={(e) => handleUpdate('weight', Number(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`required-${question.id}`}>Obrigatório</Label>
            <Switch
              id={`required-${question.id}`}
              checked={question.isRequired}
              onCheckedChange={(checked) => handleUpdate('isRequired', checked)}
            />
          </div>
        </div>

        {/* Editor de opções para tipos que precisam */}
        {requiresOptions && (
          <AdvancedOptionsEditor
            options={question.options || []}
            onOptionsChange={handleOptionsUpdate}
            questionId={question.id}
            responseType={question.responseType}
          />
        )}

        {/* Dica/Hint */}
        <div>
          <Label htmlFor={`hint-${question.id}`}>Dica para o inspetor</Label>
          <Textarea
            id={`hint-${question.id}`}
            placeholder="Digite uma dica opcional..."
            value={question.hint || ''}
            onChange={(e) => handleUpdate('hint', e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>

        {/* Opções de mídia */}
        <div>
          <Label>Opções de mídia permitidas</Label>
          <div className="mt-2">
            <MediaOptionsToggle
              question={question}
              onUpdate={(updates) => onUpdate({ ...question, ...updates })}
            />
          </div>
        </div>

        {/* Botão para opções avançadas */}
        <div className="flex justify-between items-center pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? 'Ocultar' : 'Mostrar'} opções avançadas
          </Button>
        </div>

        {/* Seção de opções avançadas */}
        {showAdvancedOptions && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="text-sm font-medium text-gray-700">Configurações avançadas</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`conditional-${question.id}`}>Pergunta condicional</Label>
                <Switch
                  id={`conditional-${question.id}`}
                  checked={question.isConditional}
                  onCheckedChange={(checked) => handleUpdate('isConditional', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`subchecklist-${question.id}`}>Tem subchecklist</Label>
                <Switch
                  id={`subchecklist-${question.id}`}
                  checked={!!question.hasSubChecklist}
                  onCheckedChange={(checked) => handleUpdate('hasSubChecklist', checked)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
