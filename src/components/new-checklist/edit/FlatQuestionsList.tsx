
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "./QuestionEditor";

interface FlatQuestionsListProps {
  questions: ChecklistQuestion[];
  onAddQuestion: () => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export function FlatQuestionsList({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion
}: FlatQuestionsListProps) {
  // Organizar as perguntas em uma estrutura hierárquica
  const organizeQuestions = () => {
    const questionMap = new Map<string, ChecklistQuestion>();
    const rootQuestions: ChecklistQuestion[] = [];
    const childrenMap = new Map<string, ChecklistQuestion[]>();
    const subChecklistMap = new Map<string, ChecklistQuestion[]>();
    
    // Indexar todas as perguntas
    questions.forEach(q => {
      questionMap.set(q.id, q);
      
      // Inicializar arrays para filhos
      if (!childrenMap.has(q.id)) {
        childrenMap.set(q.id, []);
      }
      
      // Adicionar como filho se tiver parentQuestionId
      if (q.parentQuestionId) {
        if (!childrenMap.has(q.parentQuestionId)) {
          childrenMap.set(q.parentQuestionId, []);
        }
        childrenMap.get(q.parentQuestionId)?.push(q);
      } else {
        // É uma pergunta raiz
        rootQuestions.push(q);
      }
      
      // Agrupar perguntas de sub-checklists
      if (q.hasSubChecklist && q.subChecklistId) {
        // Procurar perguntas que pertencem a este sub-checklist
        const subQuestions = questions.filter(sq => 
          sq.parentQuestionId === q.id || 
          (sq.hint && sq.hint.includes(`"parentId":"${q.id}"`))
        );
        
        if (subQuestions.length > 0) {
          subChecklistMap.set(q.id, subQuestions);
        }
      }
    });
    
    return {
      rootQuestions: rootQuestions.sort((a, b) => a.order - b.order),
      childrenMap,
      subChecklistMap
    };
  };
  
  const { rootQuestions, childrenMap, subChecklistMap } = organizeQuestions();
  
  // Renderiza uma pergunta com suas subperguntas
  const renderQuestion = (question: ChecklistQuestion, index: number, parentNumbering: string = '') => {
    // Calcular a numeração
    const questionNumber = parentNumbering ? `${parentNumbering}.${index + 1}` : `${index + 1}`;
    
    // Verificar se tem subperguntas de sub-checklist
    const subChecklistQuestions = subChecklistMap.get(question.id) || [];
    const hasSubChecklistQuestions = subChecklistQuestions.length > 0;
    
    // Verificar se tem subperguntas normais
    const childQuestions = childrenMap.get(question.id) || [];
    const hasChildren = childQuestions.length > 0;
    
    return (
      <div key={question.id} className="mb-6">
        <div className="border rounded-md p-4">
          <div className="flex items-start justify-between mb-3">
            <span className="font-semibold text-sm bg-muted px-2 py-1 rounded">
              {questionNumber}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteQuestion(question.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <QuestionEditor
            question={question}
            onUpdate={onUpdateQuestion}
          />
        </div>
        
        {/* Renderizar perguntas do sub-checklist */}
        {hasSubChecklistQuestions && (
          <div className="mt-2 ml-6 space-y-2 border-l-2 border-green-200 pl-4">
            {subChecklistQuestions
              .sort((a, b) => a.order - b.order)
              .map((subQuestion, subIndex) => (
                <div key={subQuestion.id} className="border rounded-md p-3 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-semibold text-sm bg-muted px-2 py-1 rounded">
                      {`${questionNumber}.${subIndex + 1}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteQuestion(subQuestion.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <QuestionEditor
                    question={subQuestion}
                    onUpdate={onUpdateQuestion}
                    isSubQuestion={true}
                  />
                </div>
              ))
            }
          </div>
        )}
        
        {/* Renderiza as perguntas filhas normais */}
        {hasChildren && (
          <div className="mt-2 ml-6 space-y-2">
            {childQuestions
              .sort((a, b) => a.order - b.order)
              .map((child, childIndex) => (
                renderQuestion(child, childIndex, questionNumber)
              ))
            }
          </div>
        )}
      </div>
    );
  };
  
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded">
        <p className="text-muted-foreground mb-4">Nenhuma pergunta adicionada</p>
        <Button 
          variant="outline" 
          onClick={onAddQuestion}
          className="mx-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Pergunta
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rootQuestions.map((question, index) => renderQuestion(question, index))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={onAddQuestion}
        className="w-full mt-6"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Pergunta
      </Button>
    </div>
  );
}
