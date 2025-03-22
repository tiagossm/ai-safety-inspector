
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIAssistantType } from "@/hooks/new-checklist/useChecklistAI";
import { useOpenAIAssistants } from "@/hooks/new-checklist/useOpenAIAssistants";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

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
  const { assistants, isLoading: loadingAssistants, refetch: loadAssistants, error } = useOpenAIAssistants();

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
            <div className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              <RadioGroupItem value="general" id="general" className="mb-3" />
              <Label htmlFor="general" className="text-center font-medium">Geral</Label>
              <span className="text-center text-sm text-muted-foreground mt-1">
                Checklists para uso geral e diversos propósitos
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              <RadioGroupItem value="workplace-safety" id="workplace-safety" className="mb-3" />
              <Label htmlFor="workplace-safety" className="text-center font-medium">Segurança</Label>
              <span className="text-center text-sm text-muted-foreground mt-1">
                Segurança do trabalho, prevenção de acidentes
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              <RadioGroupItem value="compliance" id="compliance" className="mb-3" />
              <Label htmlFor="compliance" className="text-center font-medium">Conformidade</Label>
              <span className="text-center text-sm text-muted-foreground mt-1">
                Auditorias, normas e requisitos regulatórios
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              <RadioGroupItem value="quality" id="quality" className="mb-3" />
              <Label htmlFor="quality" className="text-center font-medium">Qualidade</Label>
              <span className="text-center text-sm text-muted-foreground mt-1">
                Controle de qualidade e processos
              </span>
            </div>
          </div>
        </RadioGroup>
      </div>

      {onOpenAIAssistantChange && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="openai-assistant" className="text-lg font-medium">
              Assistentes OpenAI
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => loadAssistants()}
              disabled={loadingAssistants}
            >
              {loadingAssistants ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1">Atualizar lista</span>
            </Button>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 mb-2">
              {error}
            </div>
          )}
          
          <Select
            value={openAIAssistant || "none"}
            onValueChange={onOpenAIAssistantChange}
            disabled={loadingAssistants}
          >
            <SelectTrigger id="openai-assistant" className="w-full">
              <SelectValue placeholder={loadingAssistants ? "Carregando assistentes..." : "Selecione um assistente especializado (opcional)"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum assistente específico</SelectItem>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.id}>
                  {assistant.name}{assistant.model ? ` (${assistant.model})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {assistants.length > 0 ? (
            <p className="text-sm text-muted-foreground mt-1">
              {assistants.length} assistentes encontrados. Selecione um para gerar checklists mais específicos.
            </p>
          ) : !loadingAssistants && (
            <p className="text-sm text-muted-foreground mt-1">
              Nenhum assistente encontrado. Crie assistentes em platform.openai.com/assistants
            </p>
          )}
        </div>
      )}
    </div>
  );
}
