
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface QuestionOptionsProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function QuestionOptions({ options, onChange }: QuestionOptionsProps) {
  const [newOption, setNewOption] = React.useState("");

  const handleAddOption = () => {
    if (newOption.trim()) {
      onChange([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onChange(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium mb-1">Opções de resposta</div>
      
      {options.map((option, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="flex-grow"
            placeholder={`Opção ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveOption(index)}
            className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <div className="flex gap-2">
        <Input
          placeholder="Nova opção..."
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddOption();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddOption}
          disabled={!newOption.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
