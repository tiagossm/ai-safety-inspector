
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Bot, ShieldCheck, Briefcase, BarChart } from "lucide-react";

// Match the AIAssistantType from useChecklistAI.ts
export type AIAssistantType = "general" | "workplace-safety" | "compliance" | "quality";

interface AIAssistantSelectorProps {
  selectedAssistant: string; 
  onAssistantTypeChange: (type: string) => void;
}

export function AIAssistantSelector({
  selectedAssistant,
  onAssistantTypeChange
}: AIAssistantSelectorProps) {
  return (
    <div className="space-y-4">
      <Label>Tipo de Assistente</Label>
      <RadioGroup
        value={selectedAssistant}
        onValueChange={onAssistantTypeChange}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Label
          htmlFor="assistant-general"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer ${
            selectedAssistant === "general" ? "border-primary bg-primary/5" : "border-muted"
          } hover:border-primary/50 transition-all`}
        >
          <RadioGroupItem value="general" id="assistant-general" className="sr-only" />
          <Bot className="h-8 w-8 mb-2" />
          <span className="font-medium">Geral</span>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Checklist genérico para uso geral
          </p>
        </Label>

        <Label
          htmlFor="assistant-safety"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer ${
            selectedAssistant === "workplace-safety" ? "border-primary bg-primary/5" : "border-muted"
          } hover:border-primary/50 transition-all`}
        >
          <RadioGroupItem value="workplace-safety" id="assistant-safety" className="sr-only" />
          <ShieldCheck className="h-8 w-8 mb-2" />
          <span className="font-medium">Segurança</span>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Checklist de segurança do trabalho e NRs
          </p>
        </Label>

        <Label
          htmlFor="assistant-compliance"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer ${
            selectedAssistant === "compliance" ? "border-primary bg-primary/5" : "border-muted"
          } hover:border-primary/50 transition-all`}
        >
          <RadioGroupItem value="compliance" id="assistant-compliance" className="sr-only" />
          <Briefcase className="h-8 w-8 mb-2" />
          <span className="font-medium">Compliance</span>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Checklist para conformidade regulatória
          </p>
        </Label>

        <Label
          htmlFor="assistant-quality"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer ${
            selectedAssistant === "quality" ? "border-primary bg-primary/5" : "border-muted"
          } hover:border-primary/50 transition-all`}
        >
          <RadioGroupItem value="quality" id="assistant-quality" className="sr-only" />
          <BarChart className="h-8 w-8 mb-2" />
          <span className="font-medium">Qualidade</span>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Checklist para controle de qualidade
          </p>
        </Label>
      </RadioGroup>
    </div>
  );
}

export function OpenAIAssistantSelector({
  selectedAssistant,
  setSelectedAssistant
}: {
  selectedAssistant: string;
  setSelectedAssistant: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="openAI">Assistente AI</Label>
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <h4 className="text-sm font-medium">Assistente OpenAI</h4>
            <p className="text-xs text-muted-foreground">
              Gera checklists utilizando modelos avançados de linguagem
            </p>
          </div>
          <input
            type="radio"
            id="openAI"
            value="openai"
            checked={selectedAssistant === "openai"}
            onChange={() => setSelectedAssistant("openai")}
            className="rounded-full"
          />
        </div>
      </Card>
    </div>
  );
}
