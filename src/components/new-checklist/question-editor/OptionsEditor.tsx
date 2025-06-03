
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface OptionsEditorProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function OptionsEditor({ question, onUpdate }: OptionsEditorProps) {
  const [newOption, setNewOption] = useState("");
  const options = question.options || [];

  const addOption = () => {
    if (newOption.trim()) {
      onUpdate({
        ...question,
        options: [...options, newOption.trim()]
      });
      setNewOption("");
      toast.success("Opção adicionada");
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdate({
      ...question,
      options: newOptions
    });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onUpdate({
      ...question,
      options: newOptions
    });
    toast.success("Opção removida");
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2 group">
          <div className="flex items-center">
            <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm text-gray-600 ml-1 min-w-[2rem]">
              {index + 1}.
            </span>
          </div>
          
          <Input
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            placeholder={`Opção ${index + 1}`}
            className="flex-1"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeOption(index)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 ml-1 min-w-[2rem]">
            {options.length + 1}.
          </span>
        </div>
        
        <Input
          placeholder="Adicionar opção"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOption();
            }
          }}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={addOption}
          disabled={!newOption.trim()}
          className="text-gray-400 hover:text-blue-500"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
