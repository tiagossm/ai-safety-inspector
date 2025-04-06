
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIAssistantType } from "@/hooks/new-checklist/useChecklistAI";
import { AIAssistantSelector } from "./AIAssistantSelector";
import { Card } from "@/components/ui/card";
import { NewChecklist } from "@/types/checklist";

interface ContextField {
  type: string;
  value: string;
}

interface IntelligentChecklistFormProps {
  selectedAssistant: AIAssistantType;
  onAssistantTypeChange: (type: AIAssistantType) => void;
  openAIAssistant: string;
  onOpenAIAssistantChange: (id: string) => void;
  onPromptChange: (prompt: string) => void;
  checklist: {
    title?: string;
    description?: string;
    category?: string;
    company_name?: string;
    company_id?: string | null;
  };
  setChecklist: React.Dispatch<React.SetStateAction<NewChecklist>>;
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
  const [environmentType, setEnvironmentType] = useState<string>("indoor");
  const [checklistFocus, setChecklistFocus] = useState<string>("safety");
  const [context, setContext] = useState<ContextField>({
    type: "sector",
    value: ""
  });
  
  // Generate the prompt based on the form inputs
  useEffect(() => {
    const companyInfo = checklist.company_name 
      ? `para a empresa ${checklist.company_name}` 
      : "";
      
    const categoryInfo = checklist.category 
      ? `relacionado à ${checklist.category}` 
      : "";
      
    const environmentInfo = {
      indoor: "ambiente interno",
      outdoor: "ambiente externo",
      mixed: "ambiente misto (interno e externo)"
    }[environmentType] || "ambiente";
      
    const focusInfo = {
      safety: "focado em segurança do trabalho",
      quality: "focado em controle de qualidade",
      maintenance: "focado em manutenção preventiva",
      compliance: "focado em conformidade regulatória"
    }[checklistFocus] || "";
      
    const contextInfo = context.value 
      ? `para ${context.type === "sector" ? "o setor" : context.type === "role" ? "a função" : "a atividade"} de ${context.value}` 
      : "";
      
    const prompt = `Criar um checklist ${categoryInfo} ${companyInfo} em ${environmentInfo} ${focusInfo} ${contextInfo}. Inclua perguntas específicas e relevantes.`;
      
    onPromptChange(prompt.trim());
    
    if (!checklist.title && checklist.category && context.value) {
      setChecklist(prev => ({
        ...prev,
        title: `Checklist ${checklist.category} - ${context.value}`
      }));
    }
  }, [environmentType, checklistFocus, context, checklist.company_name, checklist.category]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Configure seu checklist inteligente</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="environment">Tipo de ambiente</Label>
            <Select 
              value={environmentType} 
              onValueChange={setEnvironmentType}
            >
              <SelectTrigger id="environment">
                <SelectValue placeholder="Selecione o tipo de ambiente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Ambiente interno</SelectItem>
                <SelectItem value="outdoor">Ambiente externo</SelectItem>
                <SelectItem value="mixed">Ambiente misto (interno e externo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="focus">Foco do checklist</Label>
            <Select 
              value={checklistFocus} 
              onValueChange={setChecklistFocus}
            >
              <SelectTrigger id="focus">
                <SelectValue placeholder="Selecione o foco do checklist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Segurança do trabalho</SelectItem>
                <SelectItem value="quality">Controle de qualidade</SelectItem>
                <SelectItem value="maintenance">Manutenção preventiva</SelectItem>
                <SelectItem value="compliance">Conformidade regulatória</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="context-type">Contexto específico</Label>
            <div className="flex gap-2">
              <Select 
                value={context.type} 
                onValueChange={(value) => setContext(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="context-type" className="w-1/3">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sector">Setor</SelectItem>
                  <SelectItem value="role">Função</SelectItem>
                  <SelectItem value="activity">Atividade</SelectItem>
                </SelectContent>
              </Select>
              
              <Input 
                id="context-value"
                className="w-2/3"
                value={context.value}
                onChange={(e) => setContext(prev => ({ ...prev, value: e.target.value }))}
                placeholder={`Ex: ${context.type === "sector" ? "Almoxarifado" : context.type === "role" ? "Operador" : "Montagem"}`}
              />
            </div>
          </div>
        </div>
        
        <div>
          <Card className="p-4 bg-slate-50">
            <div className="mb-2">
              <h4 className="text-sm font-medium">Pré-visualização do prompt</h4>
            </div>
            <div className="bg-white border rounded-md p-3 text-sm">
              <p className="whitespace-pre-wrap">
                {`Criar um checklist ${checklist.category ? `relacionado à ${checklist.category}` : ""} ${
                  checklist.company_name ? `para a empresa ${checklist.company_name}` : ""
                } em ${
                  environmentType === "indoor" ? "ambiente interno" :
                  environmentType === "outdoor" ? "ambiente externo" : 
                  "ambiente misto (interno e externo)"
                } ${
                  checklistFocus === "safety" ? "focado em segurança do trabalho" :
                  checklistFocus === "quality" ? "focado em controle de qualidade" :
                  checklistFocus === "maintenance" ? "focado em manutenção preventiva" :
                  "focado em conformidade regulatória"
                } ${
                  context.value ? `para ${
                    context.type === "sector" ? "o setor" : 
                    context.type === "role" ? "a função" : 
                    "a atividade"
                  } de ${context.value}` : ""
                }. Inclua perguntas específicas e relevantes.`}
              </p>
            </div>
          </Card>
          
          <div className="mt-6">
            <AIAssistantSelector
              selectedAssistant={selectedAssistant}
              onChange={onAssistantTypeChange}
              openAIAssistant={openAIAssistant}
              onOpenAIAssistantChange={onOpenAIAssistantChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
