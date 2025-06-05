
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical, Award, CheckCircle } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ChecklistItemOption } from "@/types/multipleChoice";

interface MultipleChoiceOptionsEditorProps {
  options: ChecklistItemOption[];
  onOptionsChange: (options: ChecklistItemOption[]) => void;
  hasScoring?: boolean;
  showCorrectAnswer?: boolean;
  onHasScoringChange?: (hasScoring: boolean) => void;
  onShowCorrectAnswerChange?: (showCorrect: boolean) => void;
}

export function MultipleChoiceOptionsEditor({
  options,
  onOptionsChange,
  hasScoring = false,
  showCorrectAnswer = false,
  onHasScoringChange,
  onShowCorrectAnswerChange
}: MultipleChoiceOptionsEditorProps) {
  const [newOptionText, setNewOptionText] = useState("");

  const addOption = useCallback(() => {
    if (!newOptionText.trim()) return;

    const newOption: ChecklistItemOption = {
      id: `new-${Date.now()}`,
      item_id: "",
      option_text: newOptionText.trim(),
      option_value: newOptionText.trim(),
      sort_order: options.length,
      score: hasScoring ? 0 : undefined,
      is_correct: showCorrectAnswer ? false : undefined,
    };

    onOptionsChange([...options, newOption]);
    setNewOptionText("");
  }, [newOptionText, options, onOptionsChange, hasScoring, showCorrectAnswer]);

  const updateOption = useCallback((index: number, updates: Partial<ChecklistItemOption>) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], ...updates };
    onOptionsChange(updatedOptions);
  }, [options, onOptionsChange]);

  const removeOption = useCallback((index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    // Reordenar sort_order
    const reorderedOptions = updatedOptions.map((option, i) => ({
      ...option,
      sort_order: i
    }));
    onOptionsChange(reorderedOptions);
  }, [options, onOptionsChange]);

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const reorderedOptions = Array.from(options);
    const [removed] = reorderedOptions.splice(result.source.index, 1);
    reorderedOptions.splice(result.destination.index, 0, removed);

    // Atualizar sort_order
    const updatedOptions = reorderedOptions.map((option, index) => ({
      ...option,
      sort_order: index
    }));

    onOptionsChange(updatedOptions);
  }, [options, onOptionsChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          Opções de Resposta
          <span className="text-xs text-muted-foreground">
            ({options.length} opção{options.length !== 1 ? 'ões' : ''})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configurações de scoring e validação */}
        <div className="grid grid-cols-2 gap-4">
          {onHasScoringChange && (
            <div className="flex items-center gap-2">
              <Switch
                id="has-scoring"
                checked={hasScoring}
                onCheckedChange={onHasScoringChange}
              />
              <Label htmlFor="has-scoring" className="text-sm flex items-center gap-1">
                <Award className="h-3 w-3" />
                Pontuação
              </Label>
            </div>
          )}

          {onShowCorrectAnswerChange && (
            <div className="flex items-center gap-2">
              <Switch
                id="show-correct"
                checked={showCorrectAnswer}
                onCheckedChange={onShowCorrectAnswerChange}
              />
              <Label htmlFor="show-correct" className="text-sm flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Resposta Correta
              </Label>
            </div>
          )}
        </div>

        {/* Lista de opções */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="options">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {options.map((option, index) => (
                  <Draggable key={option.id} draggableId={option.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-2 p-3 border rounded-md ${
                          snapshot.isDragging ? 'bg-muted' : 'bg-background'
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <Input
                              value={option.option_text}
                              onChange={(e) => updateOption(index, { 
                                option_text: e.target.value,
                                option_value: e.target.value 
                              })}
                              placeholder="Texto da opção"
                              className="text-sm"
                            />
                          </div>

                          {hasScoring && (
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={option.score || 0}
                                onChange={(e) => updateOption(index, { 
                                  score: parseFloat(e.target.value) || 0 
                                })}
                                placeholder="Pontos"
                                className="text-sm"
                                min="0"
                                step="0.1"
                              />
                            </div>
                          )}

                          {showCorrectAnswer && (
                            <div className="col-span-2 flex justify-center">
                              <Switch
                                checked={option.is_correct || false}
                                onCheckedChange={(checked) => updateOption(index, { 
                                  is_correct: checked 
                                })}
                              />
                            </div>
                          )}

                          <div className={hasScoring ? "col-span-2" : showCorrectAnswer ? "col-span-4" : "col-span-6"}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Adicionar nova opção */}
        <div className="flex gap-2">
          <Input
            value={newOptionText}
            onChange={(e) => setNewOptionText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma nova opção..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addOption}
            disabled={!newOptionText.trim()}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {options.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Nenhuma opção adicionada ainda.</p>
            <p className="text-xs">Digite uma opção acima e clique em "Adicionar".</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
