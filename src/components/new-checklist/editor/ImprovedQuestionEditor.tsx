
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  Camera,
  AlertTriangle,
  CheckCircle2,
  Plus
} from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import { StandardResponseType, TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";
import { MediaCard } from "./MediaCard";
import { UnifiedOptionsEditor } from "./UnifiedOptionsEditor";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ImprovedQuestionEditorProps {
  question: ChecklistQuestion;
  questionIndex: number;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (id: string) => void;
  onAddSubQuestion?: (parentId: string) => void;
  isDragging?: boolean;
}

export function ImprovedQuestionEditor({
  question,
  questionIndex,
  onUpdate,
  onDelete,
  onAddSubQuestion,
  isDragging = false
}: ImprovedQuestionEditorProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showMediaCard, setShowMediaCard] = useState(false);
  
  const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(question.responseType);
  
  // Validação da pergunta
  const validation = React.useMemo(() => {
    const hasText = question.text.trim().length > 0;
    const hasValidOptions = !requiresOptions || (question.options && question.options.length > 0);
    const hasValidWeight = question.weight > 0;
    
    return {
      isValid: hasText && hasValidOptions && hasValidWeight,
      hasText,
      hasValidOptions,
      hasValidWeight,
      issues: [
        !hasText && "Texto da pergunta é obrigatório",
        !hasValidOptions && "Opções de resposta são obrigatórias para este tipo",
        !hasValidWeight && "Peso deve ser maior que zero"
      ].filter(Boolean)
    };
  }, [question.text, question.options, question.weight, requiresOptions]);

  const handleUpdate = useCallback((field: keyof ChecklistQuestion, value: any) => {
    const updatedQuestion = { ...question, [field]: value };
    
    // Limpar opções se o tipo não exigir
    if (field === 'responseType' && !TYPES_REQUIRING_OPTIONS.includes(value as StandardResponseType)) {
      updatedQuestion.options = [];
    }
    
    onUpdate(updatedQuestion);
  }, [question, onUpdate]);

  const handleOptionsUpdate = useCallback((newOptions: string[]) => {
    onUpdate({ ...question, options: newOptions });
  }, [question, onUpdate]);

  const handleMediaUpdate = useCallback((updates: Partial<ChecklistQuestion>) => {
    onUpdate({ ...question, ...updates });
  }, [question, onUpdate]);

  const handleAddSubQuestion = useCallback(() => {
    if (onAddSubQuestion) {
      onAddSubQuestion(question.id);
    }
  }, [onAddSubQuestion, question.id]);

  const hasMediaEnabled = question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles;

  return (
    <Card className={`transition-all duration-200 ${isDragging ? 'opacity-50 rotate-1 shadow-lg' : 'hover:shadow-md'} ${!validation.isValid ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="cursor-move hover:bg-gray-100 p-1 rounded">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                #{questionIndex + 1}
              </Badge>
              {validation.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              {question.isRequired && (
                <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
              )}
              {hasMediaEnabled && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  Mídia
                </Badge>
              )}
            </div>
            
            {!validation.isValid && validation.issues.length > 0 && (
              <div className="text-xs text-red-600">
                {validation.issues.join(", ")}
              </div>
            )}
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Texto da pergunta */}
        <div>
          <Label htmlFor={`question-text-${question.id}`} className="text-sm font-medium">
            Texto da pergunta *
          </Label>
          <Textarea
            id={`question-text-${question.id}`}
            placeholder="Digite sua pergunta aqui..."
            value={question.text}
            onChange={(e) => handleUpdate('text', e.target.value)}
            className={`mt-1 resize-none ${!question.text.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
            rows={2}
          />
        </div>

        {/* Grid de configurações principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Tipo de resposta</Label>
            <ResponseTypeSelector
              value={question.responseType}
              onChange={(type) => handleUpdate('responseType', type)}
              showDescriptions={false}
            />
          </div>

          <div>
            <Label htmlFor={`weight-${question.id}`} className="text-sm font-medium">
              Peso/Pontos
            </Label>
            <Input
              id={`weight-${question.id}`}
              type="number"
              min="1"
              max="100"
              value={question.weight}
              onChange={(e) => handleUpdate('weight', Number(e.target.value))}
              className={question.weight <= 0 ? 'border-red-300' : ''}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <Label htmlFor={`required-${question.id}`} className="text-sm font-medium">
              Obrigatório
            </Label>
            <Switch
              id={`required-${question.id}`}
              checked={question.isRequired}
              onCheckedChange={(checked) => handleUpdate('isRequired', checked)}
            />
          </div>
        </div>

        {/* Editor de opções unificado */}
        {requiresOptions && (
          <UnifiedOptionsEditor
            options={question.options || []}
            onOptionsChange={handleOptionsUpdate}
            questionId={question.id}
            responseType={question.responseType}
          />
        )}

        {/* Dica/Hint */}
        <div>
          <Label htmlFor={`hint-${question.id}`} className="text-sm font-medium">
            Dica para o inspetor
          </Label>
          <Textarea
            id={`hint-${question.id}`}
            placeholder="Digite uma dica opcional que ajudará o inspetor..."
            value={question.hint || ''}
            onChange={(e) => handleUpdate('hint', e.target.value)}
            className="mt-1 resize-none"
            rows={2}
          />
        </div>

        <Separator />

        {/* Seções colapsáveis */}
        <div className="space-y-2">
          {/* Configurações de mídia */}
          <Collapsible open={showMediaCard} onOpenChange={setShowMediaCard}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center justify-between w-full p-2 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Camera className="h-4 w-4" />
                  Configurações de mídia
                  {hasMediaEnabled && (
                    <Badge variant="secondary" className="text-xs">Ativo</Badge>
                  )}
                </span>
                {showMediaCard ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2">
                <MediaCard
                  question={question}
                  onUpdate={handleMediaUpdate}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Opções avançadas */}
          <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center justify-between w-full p-2 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Settings className="h-4 w-4" />
                  Opções avançadas
                </span>
                {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor={`conditional-${question.id}`} className="text-sm font-medium">
                      Pergunta condicional
                    </Label>
                    <Switch
                      id={`conditional-${question.id}`}
                      checked={question.isConditional}
                      onCheckedChange={(checked) => handleUpdate('isConditional', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor={`subchecklist-${question.id}`} className="text-sm font-medium">
                      Tem subchecklist
                    </Label>
                    <Switch
                      id={`subchecklist-${question.id}`}
                      checked={!!question.hasSubChecklist}
                      onCheckedChange={(checked) => handleUpdate('hasSubChecklist', checked)}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Ações da pergunta */}
        {onAddSubQuestion && (
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubQuestion}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Subpergunta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
