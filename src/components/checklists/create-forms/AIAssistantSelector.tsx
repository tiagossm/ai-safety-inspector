
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { AIAssistantType } from "@/types/newChecklist";

interface AIAssistantOption {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface AIAssistantSelectorProps {
  selectedAssistant: string;
  setSelectedAssistant: (value: string) => void;
}

export function AIAssistantSelector({
  selectedAssistant,
  setSelectedAssistant
}: AIAssistantSelectorProps) {
  // Predefined assistant types
  const assistantOptions: AIAssistantOption[] = [
    {
      id: "workplace-safety",
      value: "workplace-safety",
      label: "Segurança do Trabalho",
      description: "Especialista em normas de segurança do trabalho (NRs)",
      icon: "🛡️"
    },
    {
      id: "compliance",
      value: "compliance",
      label: "Compliance",
      description: "Especialista em conformidade legal e regulatória",
      icon: "📋"
    },
    {
      id: "quality",
      value: "quality",
      label: "Qualidade",
      description: "Especialista em processos e controle de qualidade",
      icon: "✅"
    },
    {
      id: "checklist",
      value: "checklist",
      label: "Checklist Geral",
      description: "Assistente geral para criação de checklists diversos",
      icon: "📝"
    },
    {
      id: "openai",
      value: "openai",
      label: "Modelo GPT-4",
      description: "Assistente de IA generativa avançada (recomendado)",
      icon: "🤖"
    }
  ];

  // Select default if nothing is selected
  useEffect(() => {
    if (!selectedAssistant) {
      setSelectedAssistant("openai");
    }
  }, [selectedAssistant, setSelectedAssistant]);

  return (
    <div className="space-y-3">
      <Label>Assistente de IA</Label>
      <RadioGroup
        value={selectedAssistant}
        onValueChange={setSelectedAssistant}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {assistantOptions.map((option) => (
          <Card 
            key={option.id} 
            className={`relative p-4 cursor-pointer transition-colors border hover:bg-gray-50 ${
              selectedAssistant === option.value ? "border-primary bg-primary/5" : "border-gray-200"
            }`}
            onClick={() => setSelectedAssistant(option.value)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-lg w-8 h-8 flex items-center justify-center">
                {option.icon}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
              <RadioGroupItem 
                value={option.value}
                id={option.id}
                className="flex-shrink-0"
              />
            </div>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}

export default AIAssistantSelector;
