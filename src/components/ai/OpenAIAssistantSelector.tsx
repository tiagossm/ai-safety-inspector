
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AIAssistantType } from '@/types/newChecklist';

export interface AIAssistantSelectorProps {
  selectedAssistant: AIAssistantType;
  onAssistantTypeChange: (type: AIAssistantType) => void;
  openAIAssistant: string;
  onOpenAIAssistantChange: (id: string) => void;
}

export function AIAssistantSelector({
  selectedAssistant,
  onAssistantTypeChange,
  openAIAssistant,
  onOpenAIAssistantChange
}: AIAssistantSelectorProps) {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedAssistant}
        onValueChange={(value) => onAssistantTypeChange(value as AIAssistantType)}
        className="grid grid-cols-2 gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="general" id="general" />
          <Label htmlFor="general">Assistente Geral</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="workplace-safety" id="workplace-safety" />
          <Label htmlFor="workplace-safety">Segurança do Trabalho</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="compliance" id="compliance" />
          <Label htmlFor="compliance">Compliance</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="quality" id="quality" />
          <Label htmlFor="quality">Qualidade</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="checklist" id="checklist" />
          <Label htmlFor="checklist">Checklist Especialista</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="openai" id="openai" />
          <Label htmlFor="openai">OpenAI</Label>
        </div>
      </RadioGroup>
      
      {selectedAssistant === "openai" && (
        <div className="pt-2">
          <Label htmlFor="openai-assistant-id">ID do Assistente OpenAI</Label>
          <input
            id="openai-assistant-id"
            type="text"
            value={openAIAssistant}
            onChange={(e) => onOpenAIAssistantChange(e.target.value)}
            placeholder="asst_123..."
            className="w-full p-2 border rounded mt-1"
          />
        </div>
      )}
    </div>
  );
}
