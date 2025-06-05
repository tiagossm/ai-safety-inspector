
import React, { useState } from "react";
import { ChecklistQuestion, DisplayCondition, DisplayConditionRule } from "@/types/newChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

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
  const [showConditions, setShowConditions] = useState(question.isConditional);

  // Filtrar perguntas disponíveis (excluir a pergunta atual e sub-perguntas)
  const parentQuestions = availableQuestions.filter(q => 
    q.id !== question.id && 
    !q.parentQuestionId &&
    q.order < question.order
  );

  const handleToggleConditional = (enabled: boolean) => {
    setShowConditions(enabled);
    
    const updatedQuestion = {
      ...question,
      isConditional: enabled,
      displayCondition: enabled ? (question.displayCondition || {
        parentQuestionId: '',
        expectedValue: '',
        rules: []
      }) : undefined
    };
    
    onUpdate(updatedQuestion);
  };

  const handleUpdateCondition = (updates: Partial<DisplayCondition>) => {
    const currentCondition = question.displayCondition || {
      parentQuestionId: '',
      expectedValue: '',
      rules: []
    };

    const updatedCondition = {
      ...currentCondition,
      ...updates
    };

    onUpdate({
      ...question,
      displayCondition: updatedCondition
    });
  };

  const handleAddRule = () => {
    const currentCondition = question.displayCondition || {
      parentQuestionId: '',
      expectedValue: '',
      rules: []
    };

    const newRule: DisplayConditionRule = {
      parentQuestionId: '',
      expectedValue: '',
      operator: 'equals'
    };

    handleUpdateCondition({
      rules: [...(currentCondition.rules || []), newRule]
    });
  };

  const handleUpdateRule = (index: number, updates: Partial<DisplayConditionRule>) => {
    const currentCondition = question.displayCondition || {
      parentQuestionId: '',
      expectedValue: '',
      rules: []
    };

    const updatedRules = [...(currentCondition.rules || [])];
    updatedRules[index] = { ...updatedRules[index], ...updates };

    handleUpdateCondition({
      rules: updatedRules
    });
  };

  const handleRemoveRule = (index: number) => {
    const currentCondition = question.displayCondition || {
      parentQuestionId: '',
      expectedValue: '',
      rules: []
    };

    const updatedRules = [...(currentCondition.rules || [])];
    updatedRules.splice(index, 1);

    handleUpdateCondition({
      rules: updatedRules
    });
  };

  if (parentQuestions.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <p className="text-sm text-amber-700">
            Não há perguntas anteriores disponíveis para criar condições.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-blue-800">
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
          <div className="text-xs text-blue-600 mb-3">
            Esta pergunta será exibida apenas quando as condições forem atendidas.
          </div>

          {/* Condição Principal */}
          <div className="space-y-3 p-3 border border-blue-200 rounded bg-white">
            <Label className="text-xs font-medium">Condição Principal</Label>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-600">Pergunta Pai</Label>
                <Select
                  value={question.displayCondition?.parentQuestionId || ''}
                  onValueChange={(value) => handleUpdateCondition({ parentQuestionId: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {parentQuestions.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.order + 1}. {q.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600">Valor Esperado</Label>
                <Input
                  value={question.displayCondition?.expectedValue || ''}
                  onChange={(e) => handleUpdateCondition({ expectedValue: e.target.value })}
                  placeholder="Digite o valor..."
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Regras Adicionais */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Regras Adicionais</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRule}
                className="h-7"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>

            {question.displayCondition?.rules?.map((rule, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded bg-white">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    Regra {index + 1}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRule(index)}
                    className="h-6 w-6 p-0 text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Select
                      value={rule.parentQuestionId}
                      onValueChange={(value) => handleUpdateRule(index, { parentQuestionId: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Pergunta..." />
                      </SelectTrigger>
                      <SelectContent>
                        {parentQuestions.map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.order + 1}. {q.text}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={rule.operator || 'equals'}
                      onValueChange={(value) => handleUpdateRule(index, { operator: value as any })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Igual a</SelectItem>
                        <SelectItem value="not_equals">Diferente de</SelectItem>
                        <SelectItem value="contains">Contém</SelectItem>
                        <SelectItem value="greater_than">Maior que</SelectItem>
                        <SelectItem value="less_than">Menor que</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Input
                      value={rule.expectedValue}
                      onChange={(e) => handleUpdateRule(index, { expectedValue: e.target.value })}
                      placeholder="Valor..."
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            ))}

            {question.displayCondition?.rules && question.displayCondition.rules.length > 1 && (
              <div>
                <Label className="text-xs text-gray-600">Lógica entre regras</Label>
                <Select
                  value={question.displayCondition?.logic || 'AND'}
                  onValueChange={(value) => handleUpdateCondition({ logic: value as 'AND' | 'OR' })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">E (todas devem ser verdadeiras)</SelectItem>
                    <SelectItem value="OR">OU (uma deve ser verdadeira)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
