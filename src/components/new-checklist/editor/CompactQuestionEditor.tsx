
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, Settings, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import { SimpleOptionsEditor } from "./SimpleOptionsEditor";
import { CompactMediaCard } from "./CompactMediaCard";
import { TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CompactQuestionEditorProps {
  question: ChecklistQuestion;
  questionIndex: number;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  isDragging?: boolean;
}

export function CompactQuestionEditor({
  question,
  questionIndex,
  onUpdate,
  onDelete,
  isDragging = false
}: CompactQuestionEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Validação simplificada
  const isValid = React.useMemo(() => {
    const hasText = question.text && question.text.trim().length > 0;
    const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(question.responseType as any);
    const hasValidOptions = !requiresOptions || (question.options && question.options.length > 0);
    const hasValidWeight = question.weight > 0;
    
    return hasText && hasValidOptions && hasValidWeight;
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
      isDragging ? 'shadow-lg border-blue-300 bg-blue-50' : 'hover:shadow-sm'
    } ${isValid ? 'border-green-200' : 'border-amber-200'}`}>
      <CardContent className="p-4">
        {/* Header compacto */}
        <div className="flex items-start gap-3 mb-4">
          <div className="cursor-move text-gray-400 hover:text-gray-600 mt-2">
            <GripVertical className="h-4 w-4" />
          </div>
          
          <Badge variant="outline" className="mt-1">
            {questionIndex + 1}
          </Badge>
          
          <div className="flex-1 space-y-3">
            {/* Texto da pergunta */}
            <div>
              <Textarea
                placeholder="Digite o texto da pergunta..."
                value={question.text || ""}
                onChange={(e) => handleFieldUpdate("text", e.target.value)}
                className="border-0 p-0 resize-none min-h-[2rem] text-base font-medium focus-visible:ring-0"
                rows={1}
              />
            </div>

            {/* Linha de configurações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Tipo</Label>
                <ResponseTypeSelector
                  value={question.responseType}
                  onChange={(type) => handleFieldUpdate("responseType", type)}
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Peso</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={question.weight || 1}
                  onChange={(e) => handleFieldUpdate("weight", Number(e.target.value))}
                  className="h-8 text-sm"
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

              <div className="flex items-center justify-end gap-2 pt-2">
                {isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Settings className="h-3 w-3 mr-1" />
                      {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(question.id)}
                  className="h-6 px-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Editor de opções inline para tipos que requerem opções */}
            {TYPES_REQUIRING_OPTIONS.includes(question.responseType as any) && (
              <SimpleOptionsEditor
                options={question.options || []}
                onOptionsChange={handleOptionsChange}
                responseType={question.responseType}
              />
            )}
          </div>
        </div>

        {/* Configurações avançadas colapsáveis */}
        <Collapsible open={showAdvanced}>
          <CollapsibleContent className="space-y-3">
            {/* Dica para o inspetor */}
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">
                Dica para o inspetor (opcional)
              </Label>
              <Input
                placeholder="Digite uma dica que ajudará o inspetor..."
                value={question.hint || ""}
                onChange={(e) => handleFieldUpdate("hint", e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Configurações de mídia compactas */}
            <CompactMediaCard
              question={question}
              onUpdate={(updates) => onUpdate({ ...question, ...updates })}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Alertas de validação compactos */}
        {!isValid && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            Esta pergunta precisa de atenção antes de salvar
          </div>
        )}
      </CardContent>
    </Card>
  );
}
