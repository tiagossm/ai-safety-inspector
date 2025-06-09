
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConditionalQuestionCardProps {
  question: ChecklistQuestion;
  availableQuestions: ChecklistQuestion[];
  onUpdate: (updates: Partial<ChecklistQuestion>) => void;
}

export function ConditionalQuestionCard({
  question,
  availableQuestions,
  onUpdate
}: ConditionalQuestionCardProps) {
  const [isOpen, setIsOpen] = useState(question.isConditional);

  // Filtrar perguntas disponíveis para condições (excluir a própria pergunta e subperguntas)
  const conditionalQuestions = availableQuestions.filter(q => 
    q.id !== question.id && 
    !q.parentQuestionId &&
    q.responseType !== 'text' // Apenas perguntas com respostas predefinidas
  );

  const handleConditionalToggle = (enabled: boolean) => {
    setIsOpen(enabled);
    onUpdate({
      isConditional: enabled,
      displayCondition: enabled ? question.displayCondition : undefined
    });
  };

  const handleParentQuestionChange = (parentQuestionId: string) => {
    const parentQuestion = availableQuestions.find(q => q.id === parentQuestionId);
    onUpdate({
      displayCondition: {
        parentQuestionId,
        expectedValue: '',
        operator: 'equals'
      }
    });
  };

  const handleExpectedValueChange = (value: string) => {
    if (question.displayCondition) {
      onUpdate({
        displayCondition: {
          ...question.displayCondition,
          expectedValue: value
        }
      });
    }
  };

  const getParentQuestionOptions = () => {
    const parentId = question.displayCondition?.parentQuestionId;
    if (!parentId) return [];

    const parentQuestion = availableQuestions.find(q => q.id === parentId);
    if (!parentQuestion) return [];

    if (parentQuestion.responseType === 'yes_no') {
      return ['Sim', 'Não'];
    }

    if (parentQuestion.responseType === 'multiple_choice' && parentQuestion.options) {
      return parentQuestion.options;
    }

    return [];
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Pergunta Condicional
            {question.isConditional && (
              <Badge variant="warning" className="text-xs">
                Ativa
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={question.isConditional || false}
              onCheckedChange={handleConditionalToggle}
            />
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <button className="p-1">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {question.isConditional ? (
              <>
                <div className="text-xs text-amber-700 p-2 bg-amber-100 rounded">
                  <strong>Como funciona:</strong> Esta pergunta só será exibida se a condição definida for atendida.
                </div>

                {conditionalQuestions.length > 0 ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Pergunta de referência</Label>
                      <Select
                        value={question.displayCondition?.parentQuestionId || ''}
                        onValueChange={handleParentQuestionChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma pergunta..." />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionalQuestions.map(q => (
                            <SelectItem key={q.id} value={q.id}>
                              {q.text || `Pergunta ${q.order + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {question.displayCondition?.parentQuestionId && (
                      <div>
                        <Label className="text-sm font-medium">Resposta esperada</Label>
                        {getParentQuestionOptions().length > 0 ? (
                          <Select
                            value={question.displayCondition.expectedValue}
                            onValueChange={handleExpectedValueChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a resposta..." />
                            </SelectTrigger>
                            <SelectContent>
                              {getParentQuestionOptions().map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={question.displayCondition.expectedValue}
                            onChange={(e) => handleExpectedValueChange(e.target.value)}
                            placeholder="Digite a resposta esperada..."
                          />
                        )}
                      </div>
                    )}

                    {question.displayCondition?.parentQuestionId && question.displayCondition?.expectedValue && (
                      <div className="text-xs text-green-700 p-2 bg-green-100 rounded">
                        <strong>Condição:</strong> Esta pergunta será exibida quando "{availableQuestions.find(q => q.id === question.displayCondition?.parentQuestionId)?.text}" for respondida com "{question.displayCondition.expectedValue}".
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                    Não há perguntas disponíveis para criar condições. Adicione outras perguntas primeiro.
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                Ative para configurar quando esta pergunta deve ser exibida baseada na resposta de outra pergunta.
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
