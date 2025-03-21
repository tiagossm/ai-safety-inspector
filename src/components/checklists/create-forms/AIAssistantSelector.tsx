
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, RadioGroup, RadioIndicator, RadioItem, RadioLabel } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIAssistantType } from "@/hooks/new-checklist/useChecklistAI";
import { useOpenAIAssistants } from "@/hooks/useOpenAIAssistants";

interface AIAssistantSelectorProps {
  selectedAssistant: AIAssistantType;
  onChange: (assistant: AIAssistantType) => void;
  openAIAssistant?: string;
  onOpenAIAssistantChange?: (id: string) => void;
}

export function AIAssistantSelector({
  selectedAssistant,
  onChange,
  openAIAssistant,
  onOpenAIAssistantChange
}: AIAssistantSelectorProps) {
  const { assistants, loading: loadingAssistants } = useOpenAIAssistants();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Selecione o tipo de assistente</h3>
        <RadioGroup
          value={selectedAssistant}
          onValueChange={(value) => onChange(value as AIAssistantType)}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <RadioItem value="general" id="general" className="sr-only peer" />
            <RadioLabel
              htmlFor="general"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioIndicator className="mb-3" />
              <span className="text-center font-medium">Geral</span>
              <span className="text-center text-sm text-muted-foreground mt-1">
                Checklists para uso geral e diversos propósitos
              </span>
            </RadioLabel>
          </div>

          <div>
            <RadioItem value="workplace-safety" id="workplace-safety" className="sr-only peer" />
            <RadioLabel
              htmlFor="workplace-safety"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioIndicator className="mb-3" />
              <span className="text-center font-medium">Segurança</span>
              <span className="text-center text-sm text-muted-foreground mt-1">
                Segurança do trabalho, prevenção de acidentes
              </span>
            </RadioLabel>
          </div>

          <div>
            <RadioItem value="compliance" id="compliance" className="sr-only peer" />
            <RadioLabel
              htmlFor="compliance"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioIndicator className="mb-3" />
              <span className="text-center font-medium">Conformidade</span>
              <span className="text-center text-sm text-muted-foreground mt-1">
                Auditorias, normas e requisitos regulatórios
              </span>
            </RadioLabel>
          </div>

          <div>
            <RadioItem value="quality" id="quality" className="sr-only peer" />
            <RadioLabel
              htmlFor="quality"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioIndicator className="mb-3" />
              <span className="text-center font-medium">Qualidade</span>
              <span className="text-center text-sm text-muted-foreground mt-1">
                Controle de qualidade e processos
              </span>
            </RadioLabel>
          </div>
        </RadioGroup>
      </div>

      {onOpenAIAssistantChange && assistants.length > 0 && (
        <div className="mt-4">
          <Label htmlFor="openai-assistant" className="mb-2 block">
            Assistente OpenAI (Opcional)
          </Label>
          <Select
            value={openAIAssistant || ""}
            onValueChange={onOpenAIAssistantChange}
          >
            <SelectTrigger id="openai-assistant" className="w-full">
              <SelectValue placeholder="Selecione um assistente especializado (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum assistente específico</SelectItem>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Assistentes OpenAI podem gerar checklists mais específicos para sua área
          </p>
        </div>
      )}
    </div>
  );
}
