
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Settings } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConditionalRule {
  id: string;
  parentQuestionId: string;
  expectedValue: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  logicOperator?: 'AND' | 'OR';
}

interface ConditionalQuestionEditorProps {
  question: ChecklistQuestion;
  availableQuestions: ChecklistQuestion[];
  onUpdate: (question: ChecklistQuestion) => void;
}

export function ConditionalQuestionEditor({
  question,
  availableQuestions,
  onUpdate
}: ConditionalQuestionEditorProps) {
  const [showConditions, setShowConditions] = useState(question.isConditional || false);
  const [conditions, setConditions] = useState<ConditionalRule[]>(
    question.displayCondition?.rules || []
  );

  const handleToggleConditional = (enabled: boolean) => {
    setShowConditions(enabled);
    onUpdate({
      ...question,
      isConditional: enabled,
      displayCondition: enabled ? { rules: conditions, logic: 'AND' } : undefined
    });
  };

  const handleAddCondition = () => {
    const newCondition: ConditionalRule = {
      id: `condition-${Date.now()}`,
      parentQuestionId: '',
      expectedValue: '',
      operator: 'equals'
    };
    
    const updatedConditions = [...conditions, newCondition];
    setConditions(updatedConditions);
    updateQuestionConditions(updatedConditions);
  };

  const handleUpdateCondition = (index: number, field: keyof ConditionalRule, value: string) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };
    setConditions(updatedConditions);
    updateQuestionConditions(updatedConditions);
  };

  const handleRemoveCondition = (index: number) => {
    const updatedConditions = conditions.filter((_, i) => i !== index);
    setConditions(updatedConditions);
    updateQuestionConditions(updatedConditions);
  };

  const updateQuestionConditions = (rules: ConditionalRule[]) => {
    onUpdate({
      ...question,
      displayCondition: rules.length > 0 ? { rules, logic: 'AND' } : undefined
    });
  };

  // Filtrar perguntas disponíveis (excluir a pergunta atual e suas filhas)
  const eligibleParentQuestions = availableQuestions.filter(q => 
    q.id !== question.id && 
    q.order < question.order &&
    !q.parentQuestionId
  );

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-orange-800">
            Pergunta Condicional
          </CardTitle>
          <Switch
            checked={showConditions}
            onCheckedChange={handleToggleConditional}
          />
        </div>
      </CardHeader>

      {showConditions && (
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 mb-3">
            Esta pergunta será exibida apenas quando as condições abaixo forem atendidas:
          </div>

          {conditions.map((condition, index) => (
            <div key={condition.id} className="p-3 border border-orange-200 rounded-lg bg-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <Label className="text-xs">Pergunta</Label>
                  <Select
                    value={condition.parentQuestionId}
                    onValueChange={(value) => handleUpdateCondition(index, 'parentQuestionId', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleParentQuestions.map(q => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.text || `Pergunta ${q.order + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Operador</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => handleUpdateCondition(index, 'operator', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">É igual a</SelectItem>
                      <SelectItem value="not_equals">É diferente de</SelectItem>
                      <SelectItem value="contains">Contém</SelectItem>
                      <SelectItem value="greater_than">Maior que</SelectItem>
                      <SelectItem value="less_than">Menor que</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Valor esperado</Label>
                  <Input
                    value={condition.expectedValue}
                    onChange={(e) => handleUpdateCondition(index, 'expectedValue', e.target.value)}
                    placeholder="Valor..."
                    className="h-8"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCondition(index)}
                    className="h-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {index > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Operador lógico:</span>
                  <Select
                    value={condition.logicOperator || 'AND'}
                    onValueChange={(value) => handleUpdateCondition(index, 'logicOperator', value)}
                  >
                    <SelectTrigger className="h-6 w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">E</SelectItem>
                      <SelectItem value="OR">OU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCondition}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Condição
          </Button>

          {conditions.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Nenhuma condição definida. Esta pergunta será sempre exibida.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
