
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AIAssistantSelector } from "@/components/ai/OpenAIAssistantSelector";
import QuestionCountSelector from './QuestionCountSelector';
import { AIAssistantType } from '@/hooks/new-checklist/useChecklistAI';
import { NewChecklist } from '@/types/checklist';

interface IntelligentChecklistFormProps {
  selectedAssistant: AIAssistantType;
  onAssistantTypeChange: (type: AIAssistantType) => void;
  openAIAssistant: string;
  onOpenAIAssistantChange: (id: string) => void;
  onPromptChange: (prompt: string) => void;
  checklist: any;
  setChecklist: React.Dispatch<React.SetStateAction<NewChecklist>>;
  numQuestions: number;
  setNumQuestions: (count: number) => void;
}

export function IntelligentChecklistForm({
  selectedAssistant,
  onAssistantTypeChange,
  openAIAssistant,
  onOpenAIAssistantChange,
  onPromptChange,
  checklist,
  setChecklist,
  numQuestions,
  setNumQuestions
}: IntelligentChecklistFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Checklist</Label>
        <Textarea
          id="description"
          value={checklist.description || ""}
          onChange={(e) => {
            setChecklist({ ...checklist, description: e.target.value });
            onPromptChange(e.target.value);
          }}
          placeholder="Descreva o propósito deste checklist ou digite instruções para o assistente de IA"
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <AIAssistantSelector
            selectedAssistant={selectedAssistant}
            setSelectedAssistant={onAssistantTypeChange}
          />
        </div>

        <div>
          <QuestionCountSelector
            questionCount={numQuestions}
            setQuestionCount={setNumQuestions}
          />
        </div>
      </div>

      {/* Only show OpenAI Assistant ID field if "openai" is selected */}
      {selectedAssistant === "openai" && (
        <div className="space-y-2">
          <Label htmlFor="openaiAssistantId">ID do Assistente OpenAI</Label>
          <input
            id="openaiAssistantId"
            type="text"
            className="w-full p-2 border rounded"
            value={openAIAssistant}
            onChange={(e) => onOpenAIAssistantChange(e.target.value)}
            placeholder="asst_..."
          />
        </div>
      )}
    </div>
  );
}
