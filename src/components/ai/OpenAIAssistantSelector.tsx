
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AIAssistantType } from '@/types/newChecklist';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AIAssistantSelectorProps {
  selectedAssistant: string;
  setSelectedAssistant: (value: string) => void;
}

export function AIAssistantSelector({
  selectedAssistant,
  setSelectedAssistant
}: AIAssistantSelectorProps) {
  return (
    <div>
      <Label className="block mb-2">Assistente de IA</Label>
      <Select
        value={selectedAssistant}
        onValueChange={setSelectedAssistant}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um assistente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="general">Geral</SelectItem>
          <SelectItem value="workplace-safety">Segurança do Trabalho</SelectItem>
          <SelectItem value="compliance">Compliance</SelectItem>
          <SelectItem value="quality">Qualidade</SelectItem>
          <SelectItem value="checklist">Especialista em Checklist</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
