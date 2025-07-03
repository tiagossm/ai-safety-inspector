
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { FormSection } from "./FormSection";

interface Question {
  text: string;
  type: string;
  required: boolean;
  allowPhoto: boolean;
  allowVideo: boolean;
  allowAudio: boolean;
  options?: string[];
  hint?: string;
  weight?: number;
  parentId?: string;
  conditionValue?: string;
}

interface QuestionsSectionProps {
  questions: Question[];
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onQuestionChange: (index: number, field: string, value: string | boolean) => void;
}

export function QuestionsSection({
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionChange
}: QuestionsSectionProps) {
  return (
    <FormSection title="Perguntas">
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Pergunta {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveQuestion(index)}
                disabled={questions.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Texto da pergunta</Label>
              <Input
                value={question.text}
                onChange={(e) => onQuestionChange(index, "text", e.target.value)}
                placeholder="Digite a pergunta"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de resposta</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) => onQuestionChange(index, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim/não">Sim/Não</SelectItem>
                    <SelectItem value="texto">Texto</SelectItem>
                    <SelectItem value="numérico">Numérico</SelectItem>
                    <SelectItem value="seleção múltipla">Múltipla escolha</SelectItem>
                    <SelectItem value="foto">Foto</SelectItem>
                    <SelectItem value="assinatura">Assinatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={question.required}
                    onCheckedChange={(checked) => onQuestionChange(index, "required", checked)}
                  />
                  <Label className="text-sm">Obrigatório</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={question.allowPhoto}
                    onCheckedChange={(checked) => onQuestionChange(index, "allowPhoto", checked)}
                  />
                  <Label className="text-sm">Foto</Label>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={onAddQuestion}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar pergunta
        </Button>
      </div>
    </FormSection>
  );
}
