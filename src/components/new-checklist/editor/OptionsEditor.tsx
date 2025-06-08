
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { OptionWithId, createOptionWithId, convertStringArrayToOptions, convertOptionsToStringArray } from "@/utils/optionHelpers";

interface OptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  questionId: string;
  responseType: string;
}

export function OptionsEditor({ options, onOptionsChange, questionId, responseType }: OptionsEditorProps) {
  const [newOption, setNewOption] = useState("");
  
  // Converter string[] para OptionWithId[] mantendo IDs estáveis
  const [optionsWithIds, setOptionsWithIds] = React.useState<OptionWithId[]>(() => {
    return convertStringArrayToOptions(options);
  });

  // Sincronizar quando options prop mudar
  React.useEffect(() => {
    if (JSON.stringify(convertOptionsToStringArray(optionsWithIds)) !== JSON.stringify(options)) {
      setOptionsWithIds(convertStringArrayToOptions(options));
    }
  }, [options]);

  const updateParent = (newOptionsWithIds: OptionWithId[]) => {
    setOptionsWithIds(newOptionsWithIds);
    onOptionsChange(convertOptionsToStringArray(newOptionsWithIds));
  };

  const addOption = () => {
    if (newOption.trim()) {
      const newOptionsWithIds = [...optionsWithIds, createOptionWithId(newOption.trim())];
      updateParent(newOptionsWithIds);
      setNewOption("");
      toast.success("Opção adicionada");
    }
  };

  const updateOption = (id: string, newLabel: string) => {
    const newOptionsWithIds = optionsWithIds.map(option =>
      option.id === id ? { ...option, label: newLabel } : option
    );
    updateParent(newOptionsWithIds);
  };

  const removeOption = (id: string) => {
    const newOptionsWithIds = optionsWithIds.filter(option => option.id !== id);
    updateParent(newOptionsWithIds);
    toast.success("Opção removida");
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(optionsWithIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateParent(items);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption();
    }
  };

  return (
    <div className="space-y-3 mt-2 border-t pt-2">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`options-${questionId}`}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-md p-2' : ''}`}
            >
              {optionsWithIds.map((option, index) => (
                <Draggable key={option.id} draggableId={option.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 group ${snapshot.isDragging ? 'bg-white shadow-lg rounded-md' : ''}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="flex items-center justify-center w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                      >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      <span className="text-sm text-gray-600 min-w-[2rem]">
                        {index + 1}.
                      </span>
                      
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="flex-1"
                      />
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(option.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Nova opção"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          disabled={!newOption.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
