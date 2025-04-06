
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useOpenAIAssistants } from "@/hooks/new-checklist/useOpenAIAssistants";

interface OpenAIAssistantSelectorProps {
  selectedAssistant: string;
  setSelectedAssistant: (value: string) => void;
  required?: boolean;
}

export function OpenAIAssistantSelector({ 
  selectedAssistant, 
  setSelectedAssistant,
  required = true
}: OpenAIAssistantSelectorProps) {
  const { assistants, loading, error, refetch } = useOpenAIAssistants();

  if (loading) {
    return <Skeleton className="h-9 w-full" />;
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        <p>Erro ao carregar assistentes: {error}</p>
        <p>Verifique se a chave da API da OpenAI está configurada corretamente.</p>
        <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="openai-assistant" className="flex items-center">
        Assistente de IA
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={selectedAssistant || ""}
        onValueChange={setSelectedAssistant}
      >
        <SelectTrigger id="openai-assistant">
          <SelectValue placeholder="Selecione um assistente da OpenAI" />
        </SelectTrigger>
        <SelectContent>
          {assistants.length === 0 ? (
            <SelectItem value="no-assistants-available" disabled>
              Nenhum assistente disponível
            </SelectItem>
          ) : (
            assistants.map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.id || "default-assistant"}>
                <div className="flex items-center">
                  {assistant.name}
                  {assistant.model && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {assistant.model}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Escolha um assistente especializado para melhorar os resultados.
      </p>
    </div>
  );
}

export type AIAssistantType = 'openai' | 'claude' | 'gemini';

interface AIAssistantSelectorProps {
  selectedAssistant: AIAssistantType;
  onChange: (type: AIAssistantType) => void;
  openAIAssistant: string;
  onOpenAIAssistantChange: (id: string) => void;
}

export function AIAssistantSelector({
  selectedAssistant,
  onChange,
  openAIAssistant,
  onOpenAIAssistantChange,
}: AIAssistantSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Provedor de IA</Label>
        <Select 
          value={selectedAssistant} 
          onValueChange={(value) => onChange(value as AIAssistantType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um provedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
            <SelectItem value="claude" disabled>Claude (Em breve)</SelectItem>
            <SelectItem value="gemini" disabled>Google Gemini (Em breve)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedAssistant === 'openai' && (
        <OpenAIAssistantSelector 
          selectedAssistant={openAIAssistant}
          setSelectedAssistant={onOpenAIAssistantChange}
        />
      )}
    </div>
  );
}
