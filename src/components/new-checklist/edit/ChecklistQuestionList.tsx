
import React, { useRef, useEffect } from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { ChecklistQuestions } from "./ChecklistQuestions";
import { Card, CardContent } from "@/components/ui/card";
import { FlatQuestionsList } from "./FlatQuestionsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ChecklistQuestionList() {
  const {
    questions,
    groups,
    viewMode,
    questionsByGroup,
    nonEmptyGroups,
    isSubmitting,
    enableAllMedia,
    setViewMode,
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleDragEnd,
    toggleAllMediaOptions,
  } = useChecklistEditor();

  // Reference to scroll to the newly added question
  const questionsEndRef = useRef<HTMLDivElement>(null);
  
  // State for "all questions required" toggle
  const [allQuestionsRequired, setAllQuestionsRequired] = React.useState(false);
  
  // Effect to scroll to newly added question
  const [lastQuestionCount, setLastQuestionCount] = React.useState(questions.length);
  
  useEffect(() => {
    // If questions count increased, scroll to the new question
    if (questions.length > lastQuestionCount) {
      setTimeout(() => {
        questionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setLastQuestionCount(questions.length);
  }, [questions.length, lastQuestionCount]);

  // Handler to add a question to the default group
  const handleAddDefaultQuestion = () => {
    const newQuestionId = handleAddQuestion("default");
    
    // Scroll to the bottom after adding a new question
    setTimeout(() => {
      questionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      toast.success("Pergunta adicionada", { duration: 5000 });
    }, 100);
  };

  // Handler for toggling all questions as required
  const handleToggleAllRequired = (value: boolean) => {
    setAllQuestionsRequired(value);
    
    // Update all questions to set required state
    questions.forEach(question => {
      handleUpdateQuestion({
        ...question,
        isRequired: value
      });
    });
    
    toast.success(
      value 
        ? "Todas as perguntas marcadas como obrigatórias" 
        : "Requisito de obrigatoriedade removido das perguntas", 
      { duration: 5000 }
    );
  };

  // Handler for toggling all media options
  const handleToggleAllMedia = (value: boolean) => {
    toggleAllMediaOptions(value);
    toast.success(
      value 
        ? "Todas as opções de mídia ativadas para todas as perguntas" 
        : "Opções de mídia desativadas", 
      { duration: 5000 }
    );
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        {viewMode === "flat" ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Perguntas{questions.length > 0 ? ` (${questions.length})` : ""}
              </h2>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="all-media"
                    checked={enableAllMedia}
                    onCheckedChange={handleToggleAllMedia}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="all-media" className="text-sm">Ativar todas as mídias</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="required-questions"
                    checked={allQuestionsRequired}
                    onCheckedChange={handleToggleAllRequired}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="required-questions" className="text-sm">Todas as perguntas obrigatórias</Label>
                </div>
              
                <Button
                  variant="outline"
                  onClick={handleAddDefaultQuestion}
                  disabled={isSubmitting}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Pergunta
                </Button>
              </div>
            </div>

            <FlatQuestionsList
              questions={questions}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              enableAllMedia={enableAllMedia}
              isSubmitting={isSubmitting}
              onAddQuestion={handleAddDefaultQuestion}
            />
            <div ref={questionsEndRef} /> {/* Reference element for scrolling */}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Perguntas{questions.length > 0 ? ` (${questions.length})` : ""}
              </h2>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="all-media-grouped"
                    checked={enableAllMedia}
                    onCheckedChange={handleToggleAllMedia}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="all-media-grouped" className="text-sm">Ativar todas as mídias</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="required-questions-grouped"
                    checked={allQuestionsRequired}
                    onCheckedChange={handleToggleAllRequired}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="required-questions-grouped" className="text-sm">Todas as perguntas obrigatórias</Label>
                </div>
              </div>
            </div>
            
            <ChecklistQuestions
              questions={questions}
              groups={groups}
              nonEmptyGroups={nonEmptyGroups}
              questionsByGroup={questionsByGroup}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onAddGroup={handleAddGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onDragEnd={handleDragEnd}
              enableAllMedia={enableAllMedia}
              isSubmitting={isSubmitting}
            />
            <div ref={questionsEndRef} /> {/* Reference element for scrolling */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
