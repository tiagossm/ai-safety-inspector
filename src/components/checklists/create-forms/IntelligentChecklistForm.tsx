
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { AIAssistantSelector } from "./AIAssistantSelector";
import { AIAssistantType } from "@/hooks/new-checklist/useChecklistAI";

// Types for the environment and context
type EnvironmentType = "industrial" | "office" | "field" | "healthcare" | "retail" | "construction" | "other";
type FocusType = "safety" | "compliance" | "quality" | "maintenance" | "operations" | "training" | "other";
type ContextType = "sector" | "role" | "activity";

interface IntelligentChecklistFormProps {
  selectedAssistant: AIAssistantType;
  onAssistantTypeChange: (type: AIAssistantType) => void;
  openAIAssistant: string;
  onOpenAIAssistantChange: (id: string) => void;
  onPromptChange: (prompt: string) => void;
  checklist: any;
  setChecklist: React.Dispatch<React.SetStateAction<any>>;
}

export function IntelligentChecklistForm({
  selectedAssistant,
  onAssistantTypeChange,
  openAIAssistant,
  onOpenAIAssistantChange,
  onPromptChange,
  checklist,
  setChecklist
}: IntelligentChecklistFormProps) {
  const [environment, setEnvironment] = useState<EnvironmentType>("industrial");
  const [focus, setFocus] = useState<FocusType>("safety");
  const [contextType, setContextType] = useState<ContextType>("sector");
  const [contextValue, setContextValue] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");

  // Generate the prompt based on the selected options
  useEffect(() => {
    const companyName = checklist.company_id 
      ? `para a empresa ${checklist.company_name || "selecionada"}` 
      : "";
    
    const contextLabel = {
      sector: "Setor",
      role: "Função",
      activity: "Atividade"
    }[contextType];
    
    const contextDescription = contextValue 
      ? `${contextLabel}: ${contextValue}` 
      : "";
    
    const environmentLabels: Record<EnvironmentType, string> = {
      industrial: "ambiente industrial",
      office: "ambiente de escritório",
      field: "trabalho em campo",
      healthcare: "ambiente de saúde",
      retail: "ambiente de varejo",
      construction: "canteiro de obras",
      other: "ambiente específico"
    };
    
    const focusLabels: Record<FocusType, string> = {
      safety: "segurança do trabalho",
      compliance: "conformidade regulatória",
      quality: "controle de qualidade",
      maintenance: "manutenção preventiva",
      operations: "operações diárias",
      training: "treinamento e capacitação",
      other: "foco específico"
    };
    
    let prompt = `Gere um checklist de ${focusLabels[focus]} para ${environmentLabels[environment]} ${companyName}`;
    
    if (contextValue) {
      prompt += ` com foco em ${contextDescription}`;
    }
    
    if (checklist.category) {
      prompt += `. Categoria: ${checklist.category}`;
    }
    
    prompt += `. O checklist deve seguir as boas práticas de ${focusLabels[focus]} e ser específico para ${environmentLabels[environment]}.`;
    
    setGeneratedPrompt(prompt);
    onPromptChange(prompt);
  }, [environment, focus, contextType, contextValue, checklist.company_id, checklist.company_name, checklist.category]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="environment">Ambiente</Label>
            <Select
              value={environment}
              onValueChange={(value) => setEnvironment(value as EnvironmentType)}
            >
              <SelectTrigger id="environment">
                <SelectValue placeholder="Selecione o ambiente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industrial">Ambiente industrial</SelectItem>
                <SelectItem value="office">Escritório</SelectItem>
                <SelectItem value="field">Trabalho em campo</SelectItem>
                <SelectItem value="healthcare">Ambiente de saúde</SelectItem>
                <SelectItem value="retail">Varejo</SelectItem>
                <SelectItem value="construction">Construção civil</SelectItem>
                <SelectItem value="other">Outro ambiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus">Foco do checklist</Label>
            <Select
              value={focus}
              onValueChange={(value) => setFocus(value as FocusType)}
            >
              <SelectTrigger id="focus">
                <SelectValue placeholder="Selecione o foco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Segurança do trabalho</SelectItem>
                <SelectItem value="compliance">Conformidade regulatória</SelectItem>
                <SelectItem value="quality">Controle de qualidade</SelectItem>
                <SelectItem value="maintenance">Manutenção preventiva</SelectItem>
                <SelectItem value="operations">Operações diárias</SelectItem>
                <SelectItem value="training">Treinamento e capacitação</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contextType">Tipo de contexto</Label>
              <Select
                value={contextType}
                onValueChange={(value) => setContextType(value as ContextType)}
              >
                <SelectTrigger id="contextType">
                  <SelectValue placeholder="Selecione o tipo de contexto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sector">Setor</SelectItem>
                  <SelectItem value="role">Função</SelectItem>
                  <SelectItem value="activity">Atividade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contextValue">
                {contextType === "sector" ? "Setor específico" : 
                 contextType === "role" ? "Função específica" : 
                 "Atividade específica"}
              </Label>
              <Input
                id="contextValue"
                value={contextValue}
                onChange={(e) => setContextValue(e.target.value)}
                placeholder={
                  contextType === "sector" ? "Ex: Almoxarifado, Produção..." : 
                  contextType === "role" ? "Ex: Operador, Supervisor..." : 
                  "Ex: Manutenção elétrica, Limpeza industrial..."
                }
              />
            </div>
          </div>

          <AIAssistantSelector
            selectedAssistant={selectedAssistant}
            onChange={onAssistantTypeChange}
            openAIAssistant={openAIAssistant}
            onOpenAIAssistantChange={onOpenAIAssistantChange}
          />
        </div>
        
        <div>
          <Card className="p-6 bg-slate-50 h-full">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Preview do Prompt</h3>
              <p className="text-sm text-muted-foreground">
                Este é o prompt que será enviado para o assistente de IA
              </p>
            </div>
            
            <div className="bg-white border rounded-md p-4 text-sm font-mono whitespace-pre-wrap">
              {generatedPrompt}
            </div>
            
            <div className="mt-auto pt-6">
              <p className="text-xs text-muted-foreground italic">
                O prompt é gerado automaticamente com base nas informações fornecidas acima
                e será usado para criar um checklist personalizado usando IA.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
