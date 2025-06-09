
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GripVertical, Trash2, Settings, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from "lucide-react";
import { ResponseTypeSelector } from "./ResponseTypeSelector";
import { AdvancedOptionsEditor } from "./AdvancedOptionsEditor";
import { MediaCard } from "./MediaCard";
import { ConditionalQuestionCard } from "./ConditionalQuestionCard";
import { SubQuestionsCard } from "./SubQuestionsCard";
import { TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";

interface ImprovedQuestionEditorProps {
  question: ChecklistQuestion;
  questionIndex: number;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  onAddSubQuestion?: (parentId: string) => void;
  allQuestions?: ChecklistQuestion[];
  isDragging?: boolean;
}

export function ImprovedQuestionEditor({
  question,
  questionIndex,
  onUpdate,
  onDelete,
  onAddSubQuestion,
  allQuestions = [],
  isDragging = false
}: ImprovedQuestionEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Validação da pergunta
  const validation = React.useMemo(() => {
    const hasText = question.text && question.text.trim().length > 0;
    const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(question.responseType as any);
    const hasValidOptions = !requiresOptions || (question.options && question.options.length > 0);
    const hasValidWeight = question.weight > 0;
    
    return {
      isValid: hasText && hasValidOptions && hasValidWeight,
      hasText,
      hasValidOptions,
      hasValidWeight,
      requiresOptions
    };
  }, [question]);

  const handleFieldUpdate = (field: keyof ChecklistQuestion, value: any) => {
    const updatedQuestion = { ...question, [field]: value };
    onUpdate(updatedQuestion);
  };

  const handleOptionsChange = (options: string[]) => {
    handleFieldUpdate('options', options);
  };

  return (
    <Card className={`transition-all duration-200 ${
      isDragging ? 'shadow-lg border-blue-300 bg-blue-50' : 'hover:shadow-md'
    } ${validation.isValid ? 'border-green-200' : 'border-amber-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical className="h-5 w-5" />
          </div>
          
          <Badge variant="outline" className="min-w-[2.5rem] text-center">
            {questionIndex + 1}
          </Badge>
          
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Digite o texto da pergunta..."
                value={question.text || ""}
                onChange={(e) => handleFieldUpdate("text", e.target.value)}
                className={`border-0 p-0 resize-none min-h-[2rem] text-base font-medium ${
                  !validation.hasText ? 'text-amber-600 placeholder-amber-400' : ''
                }`}
                rows={1}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
              
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(question.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Configurações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Tipo de resposta</Label>
            <ResponseTypeSelector
              value={question.responseType}
              onChange={(type) => handleFieldUpdate("responseType", type)}
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Peso/Pontos</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={question.weight || 1}
              onChange={(e) => handleFieldUpdate("weight", Number(e.target.value))}
              className="h-9"
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id={`required-${question.id}`}
              checked={question.isRequired || false}
              onCheckedChange={(checked) => handleFieldUpdate("isRequired", checked)}
            />
            <Label htmlFor={`required-${question.id}`} className="text-xs text-gray-600">
              Obrigatório
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id={`conditional-${question.id}`}
              checked={question.isConditional || false}
              onCheckedChange={(checked) => handleFieldUpdate("isConditional", checked)}
            />
            <Label htmlFor={`conditional-${question.id}`} className="text-xs text-gray-600">
              Condicional
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Editor de opções */}
        <AdvancedOptionsEditor
          options={question.options || []}
          onOptionsChange={handleOptionsChange}
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
              onChange={(e) => handleFieldUpdate("hint", e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Configurações avançadas */}
        <Collapsible open={showAdvanced}>
          <CollapsibleContent className="space-y-4">
            {/* Configurações de mídia */}
            <MediaCard
              question={question}
              onUpdate={(updates) => onUpdate({ ...question, ...updates })}
            />

            {/* Pergunta condicional */}
            <ConditionalQuestionCard
              question={question}
              availableQuestions={allQuestions}
              onUpdate={(updates) => onUpdate({ ...question, ...updates })}
            />

            {/* Subperguntas */}
            {onAddSubQuestion && (
              <SubQuestionsCard
                question={question}
                allQuestions={allQuestions}
                onUpdateQuestion={onUpdate}
                onDeleteQuestion={onDelete}
                onAddSubQuestion={onAddSubQuestion}
              />
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Alertas de validação */}
        {!validation.isValid && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <div className="font-medium mb-1">Esta pergunta precisa de atenção:</div>
                <ul className="text-xs space-y-0.5">
                  {!validation.hasText && <li>• Adicione o texto da pergunta</li>}
                  {validation.requiresOptions && !validation.hasValidOptions && <li>• Adicione opções de resposta</li>}
                  {!validation.hasValidWeight && <li>• Defina um peso válido (maior que 0)</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
