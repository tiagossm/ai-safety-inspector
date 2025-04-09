
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AIAssistantType } from '@/types/newChecklist';
import { AIAssistantSelector } from '@/components/ai/OpenAIAssistantSelector';
import QuestionCountSelector from './QuestionCountSelector';

interface IntelligentChecklistFormProps {
  selectedAssistant: string;
  onAssistantTypeChange: (type: AIAssistantType) => void;
  openAIAssistant: string;
  onOpenAIAssistantChange: (id: string) => void;
  onPromptChange: (value: string) => void;
  checklist: any;
  setChecklist: React.Dispatch<React.SetStateAction<any>>;
  numQuestions?: number;
  setNumQuestions?: React.Dispatch<React.SetStateAction<number>>;
}

export function IntelligentChecklistForm({
  selectedAssistant,
  onAssistantTypeChange,
  openAIAssistant,
  onOpenAIAssistantChange,
  onPromptChange,
  checklist,
  setChecklist,
  numQuestions = 10,
  setNumQuestions
}: IntelligentChecklistFormProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gray-50">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              Descreva o que você deseja no checklist
            </Label>
            <Textarea
              id="description"
              value={checklist.description || ''}
              onChange={(e) => {
                setChecklist({ ...checklist, description: e.target.value });
                onPromptChange(e.target.value);
              }}
              placeholder="Ex: Criar um checklist para inspeção de equipamentos de proteção individual conforme NR-6"
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              Descreva em detalhes o objetivo do checklist, o que deve ser verificado, e quaisquer normas ou regulamentos que devem ser seguidos.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Assistente de IA</Label>
            <AIAssistantSelector
              selectedAssistant={selectedAssistant as AIAssistantType}
              onAssistantTypeChange={onAssistantTypeChange}
              openAIAssistant={openAIAssistant}
              onOpenAIAssistantChange={onOpenAIAssistantChange}
            />
          </div>
          
          {setNumQuestions && (
            <div className="space-y-2">
              <QuestionCountSelector 
                questionCount={numQuestions} 
                setQuestionCount={(count) => setNumQuestions(count)} 
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
