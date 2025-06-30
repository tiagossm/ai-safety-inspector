
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, GripVertical, AlertTriangle } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ResponseTypeSelector } from "./ResponseTypeSelector";
import { SmartOptionsManager } from "./SmartOptionsManager";
import { QuestionValidationFeedback } from "./QuestionValidationFeedback";
import { useChecklistValidation } from "@/hooks/new-checklist/useChecklistValidation";

interface EnhancedQuestionEditorProps {
  question: ChecklistQuestion;
  questionIndex: number;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  isDragging?: boolean;
}

export function EnhancedQuestionEditor({
  question,
  questionIndex,
  onUpdate,
  onDelete,
  isDragging = false
}: EnhancedQuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { validateQuestion } = useChecklistValidation();
  
  const validationErrors = validateQuestion(question);
  const hasErrors = validationErrors.length > 0;
  
  const handleFieldChange = (field: keyof ChecklistQuestion, value: any) => {
    onUpdate({
      ...question,
      [field]: value
    });
  };

  const toggleMediaOption = (mediaType: 'photo' | 'video' | 'audio' | 'files') => {
    const fieldMap = {
      photo: 'allowsPhoto',
      video: 'allowsVideo', 
      audio: 'allowsAudio',
      files: 'allowsFiles'
    } as const;
    
    const field = fieldMap[mediaType];
    handleFieldChange(field, !question[field]);
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105 rotate-1' : 'shadow-sm hover:shadow-md'
      } ${hasErrors ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {questionIndex + 1}
            </span>
            
            {hasErrors && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs font-medium">{validationErrors.length} erro(s)</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Validação sempre visível quando há erros */}
        {hasErrors && (
          <QuestionValidationFeedback errors={validationErrors} />
        )}
        
        {/* Texto da pergunta */}
        <div className="space-y-2">
          <Label htmlFor={`question-text-${question.id}`}>
            Pergunta *
          </Label>
          <Textarea
            id={`question-text-${question.id}`}
            value={question.text}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            placeholder="Digite sua pergunta aqui..."
            className={`min-h-[60px] resize-none ${hasErrors && !question.text.trim() ? 'border-red-300' : ''}`}
          />
        </div>

        {/* Tipo de resposta */}
        <div className="space-y-2">
          <Label>Tipo de Resposta</Label>
          <ResponseTypeSelector
            value={question.responseType}
            onChange={(value) => handleFieldChange('responseType', value)}
          />
        </div>

        {/* Gerenciador de opções inteligente */}
        <SmartOptionsManager 
          question={question}
          onChange={onUpdate}
        />

        {/* Seção expandida */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Dica/Hint */}
            <div className="space-y-2">
              <Label htmlFor={`question-hint-${question.id}`}>
                Dica (opcional)
              </Label>
              <Input
                id={`question-hint-${question.id}`}
                value={question.hint || ''}
                onChange={(e) => handleFieldChange('hint', e.target.value)}
                placeholder="Adicione uma dica para ajudar na resposta..."
              />
            </div>

            {/* Configurações */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`required-${question.id}`} className="text-sm">
                  Obrigatória
                </Label>
                <Switch
                  id={`required-${question.id}`}
                  checked={question.isRequired}
                  onCheckedChange={(checked) => handleFieldChange('isRequired', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`weight-${question.id}`} className="text-sm">
                  Peso
                </Label>
                <Input
                  id={`weight-${question.id}`}
                  type="number"
                  min="1"
                  max="10"
                  value={question.weight}
                  onChange={(e) => handleFieldChange('weight', parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                />
              </div>
            </div>

            {/* Opções de mídia */}
            <div className="space-y-2">
              <Label className="text-sm">Permitir anexos</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'photo' as const, label: 'Fotos', field: 'allowsPhoto' as const },
                  { key: 'video' as const, label: 'Vídeos', field: 'allowsVideo' as const },
                  { key: 'audio' as const, label: 'Áudio', field: 'allowsAudio' as const },
                  { key: 'files' as const, label: 'Arquivos', field: 'allowsFiles' as const }
                ].map(({ key, label, field }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`${key}-${question.id}`} className="text-sm">
                      {label}
                    </Label>
                    <Switch
                      id={`${key}-${question.id}`}
                      checked={question[field]}
                      onCheckedChange={() => toggleMediaOption(key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
