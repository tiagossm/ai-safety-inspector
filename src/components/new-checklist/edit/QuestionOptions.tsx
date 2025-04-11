
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, Plus } from "lucide-react";

interface QuestionOptionsProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function QuestionOptions({ options, onChange }: QuestionOptionsProps) {
  const [newOption, setNewOption] = useState("");

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

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  return (
    <div className="space-y-3">
      <Label className="block mb-2">Opções de resposta</Label>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input 
              value={option}
              onChange={(e) => handleUpdateOption(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => handleRemoveOption(index)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 pt-2">
        <Input 
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Nova opção"
          className="flex-1"
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
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
