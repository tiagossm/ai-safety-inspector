
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SubQuestionsCardProps {
  question: ChecklistQuestion;
  allQuestions: ChecklistQuestion[];
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddSubQuestion: (parentId: string) => void;
  maxDepth?: number;
}

export function SubQuestionsCard({
  question,
  allQuestions,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddSubQuestion,
  maxDepth = 3
}: SubQuestionsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Encontrar subperguntas diretas
  const subQuestions = allQuestions
    .filter(q => q.parentQuestionId === question.id)
    .sort((a, b) => a.order - b.order);

  const currentDepth = question.level || 0;
  const canAddSubQuestions = currentDepth < maxDepth;

  const handleToggleSubChecklist = (enabled: boolean) => {
    onUpdateQuestion({
      ...question,
      hasSubChecklist: enabled,
      subChecklistId: enabled ? question.subChecklistId : undefined
    });
  };

  const handleSubChecklistIdChange = (subChecklistId: string) => {
    onUpdateQuestion({
      ...question,
      subChecklistId
    });
  };

  const handleAddSubQuestion = () => {
    if (canAddSubQuestions) {
      onAddSubQuestion(question.id);
    }
  };

  const handleGenerateWithAI = () => {
    if (!aiPrompt.trim()) {
      toast.error("Digite um prompt para gerar subperguntas");
      return;
    }
    
    // TODO: Implementar geração por IA
    toast.info("Funcionalidade de IA será implementada em breve");
    setShowAIGenerator(false);
    setAiPrompt("");
  };

  if (subQuestions.length === 0 && !canAddSubQuestions) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
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
                Subperguntas
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {subQuestions.length} item{subQuestions.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {canAddSubQuestions && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIGenerator(true)}
                  className="h-7 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gerar por IA
                </Button>
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
              </div>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Gerador por IA */}
            {showAIGenerator && (
              <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                <Label className="text-sm font-medium text-purple-800 mb-2 block">
                  Gerar subperguntas com IA
                </Label>
                <div className="space-y-2">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Crie 3 subperguntas sobre segurança do trabalho..."
                    className="bg-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleGenerateWithAI}
                      disabled={!aiPrompt.trim()}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Gerar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAIGenerator(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de subperguntas */}
            {subQuestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <ArrowRight className="h-4 w-4" />
                  Subperguntas ({subQuestions.length})
                </div>
                
                {subQuestions.map((subQuestion, index) => (
                  <div key={subQuestion.id} className="ml-4 border-l-2 border-blue-300 pl-4">
                    <div className="flex items-center gap-2 mb-2 p-2 bg-white rounded border">
                      <Badge variant="outline" className="text-xs">
                        {question.order + 1}.{index + 1}
                      </Badge>
                      <span className="text-sm flex-1">
                        {subQuestion.text || `Subpergunta ${index + 1}`}
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
                  </div>
                ))}
              </div>
            )}

            {/* Limite de profundidade */}
            {!canAddSubQuestions && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                <strong>Limite atingido:</strong> Máximo de {maxDepth} níveis de subperguntas permitido.
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
