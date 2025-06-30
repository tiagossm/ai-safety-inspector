
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuestionCountSelectorProps {
  questionCount: number;
  setQuestionCount: (count: number) => void;
}

export default function QuestionCountSelector({ 
  questionCount, 
  setQuestionCount 
}: QuestionCountSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="question-count">Número de perguntas</Label>
      <Select 
        value={questionCount.toString()} 
        onValueChange={(value) => setQuestionCount(parseInt(value))}
      >
        <SelectTrigger id="question-count">
          <SelectValue placeholder="Selecione a quantidade" />
        </SelectTrigger>
        <SelectContent>
          {[5, 10, 15, 20, 25, 30].map((count) => (
            <SelectItem key={count} value={count.toString()}>
              {count} perguntas
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Escolha quantas perguntas a IA deve gerar para seu checklist.
      </p>
    </div>
  );
}
