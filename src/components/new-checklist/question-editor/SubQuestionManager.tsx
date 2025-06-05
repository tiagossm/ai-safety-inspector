
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowRight } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "./QuestionEditor";

interface SubQuestionManagerProps {
  parentQuestion: ChecklistQuestion;
  allQuestions: ChecklistQuestion[];
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddSubQuestion: (parentId: string) => void;
  maxDepth?: number;
}

export function SubQuestionManager({
  parentQuestion,
  allQuestions,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddSubQuestion,
  maxDepth = 3
}: SubQuestionManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSubChecklistOptions, setShowSubChecklistOptions] = useState(
    parentQuestion.hasSubChecklist || false
  );

  // Encontrar subperguntas diretas
  const subQuestions = allQuestions
    .filter(q => q.parentQuestionId === parentQuestion.id)
    .sort((a, b) => a.order - b.order);

  const currentDepth = parentQuestion.level || 0;
  const canAddSubQuestions = currentDepth < maxDepth;

  const handleToggleSubChecklist = (enabled: boolean) => {
    setShowSubChecklistOptions(enabled);
    onUpdateQuestion({
      ...parentQuestion,
      hasSubChecklist: enabled,
      subChecklistId: enabled ? parentQuestion.subChecklistId : undefined
    });
  };

  const handleSubChecklistIdChange = (subChecklistId: string) => {
    onUpdateQuestion({
      ...parentQuestion,
      subChecklistId
    });
  };

  const handleAddSubQuestion = () => {
    if (canAddSubQuestions) {
      onAddSubQuestion(parentQuestion.id);
    }
  };

  if (subQuestions.length === 0 && !showSubChecklistOptions && !canAddSubQuestions) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 mt-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CardTitle className="text-sm font-medium text-blue-800">
                Sub-perguntas e Checklists
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {subQuestions.length} item{subQuestions.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {canAddSubQuestions && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubQuestion}
                className="h-7"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Opção de Sub-checklist */}
            <div className="p-3 border border-blue-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Sub-checklist vinculado</Label>
                <Switch
                  checked={showSubChecklistOptions}
                  onCheckedChange={handleToggleSubChecklist}
                />
              </div>
              
              {showSubChecklistOptions && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">ID do Checklist</Label>
                  <Input
                    value={parentQuestion.subChecklistId || ''}
                    onChange={(e) => handleSubChecklistIdChange(e.target.value)}
                    placeholder="Digite o ID do checklist..."
                    className="h-8"
                  />
                  <p className="text-xs text-gray-500">
                    Quando esta pergunta for respondida, um sub-checklist será iniciado automaticamente.
                  </p>
                </div>
              )}
            </div>

            {/* Lista de sub-perguntas */}
            {subQuestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <ArrowRight className="h-4 w-4" />
                  Sub-perguntas ({subQuestions.length})
                </div>
                
                {subQuestions.map((subQuestion, index) => (
                  <div key={subQuestion.id} className="ml-4 border-l-2 border-blue-300 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {parentQuestion.order + 1}.{index + 1}
                      </Badge>
                      <span className="text-sm font-medium">
                        {subQuestion.text || `Sub-pergunta ${index + 1}`}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteQuestion(subQuestion.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <QuestionEditor
                      question={subQuestion}
                      questions={allQuestions}
                      onUpdate={onUpdateQuestion}
                      onDelete={onDeleteQuestion}
                      onAddSubQuestion={onAddSubQuestion}
                      isSubQuestion={true}
                      enableAllMedia={false}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Limite de profundidade */}
            {!canAddSubQuestions && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                <strong>Limite atingido:</strong> Máximo de {maxDepth} níveis de sub-perguntas permitido.
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
