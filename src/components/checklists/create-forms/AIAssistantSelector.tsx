
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HardHat, ClipboardCheck, Shield, FileCheck } from "lucide-react";

export type AIAssistantType = "workplace-safety" | "compliance" | "quality" | "general";

interface AIAssistantSelectorProps {
  selectedAssistant: AIAssistantType;
  onChange: (assistant: AIAssistantType) => void;
}

interface Assistant {
  id: AIAssistantType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const assistants: Assistant[] = [
  {
    id: "workplace-safety",
    name: "Segurança do Trabalho",
    description: "Especialista em normas de segurança, EPIs e prevenção de acidentes",
    icon: <HardHat className="h-8 w-8 text-amber-500" />,
  },
  {
    id: "compliance",
    name: "Conformidade",
    description: "Especialista em regulamentações e conformidade legal para empresas",
    icon: <Shield className="h-8 w-8 text-blue-500" />,
  },
  {
    id: "quality",
    name: "Qualidade",
    description: "Especialista em controle de qualidade e processos de melhoria contínua",
    icon: <ClipboardCheck className="h-8 w-8 text-green-500" />,
  },
  {
    id: "general",
    name: "Geral",
    description: "Assistente geral para diversos tipos de checklists",
    icon: <FileCheck className="h-8 w-8 text-purple-500" />,
  },
];

export function AIAssistantSelector({ selectedAssistant, onChange }: AIAssistantSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Selecione um Assistente IA</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Escolha um assistente especializado para gerar perguntas mais relevantes
        </p>
      </div>
      
      <RadioGroup 
        value={selectedAssistant} 
        onValueChange={(value) => onChange(value as AIAssistantType)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {assistants.map((assistant) => (
          <div key={assistant.id} className="relative">
            <RadioGroupItem
              value={assistant.id}
              id={`assistant-${assistant.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`assistant-${assistant.id}`}
              className="flex items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <div className="mt-1">{assistant.icon}</div>
              <div className="space-y-1">
                <p className="font-medium leading-none">{assistant.name}</p>
                <p className="text-sm text-muted-foreground">
                  {assistant.description}
                </p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
