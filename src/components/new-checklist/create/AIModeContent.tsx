
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Wand2 } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { toast } from "sonner";

interface AIModeContentProps {
  onQuestionsGenerated: (questions: ChecklistQuestion[]) => void;
  onCancel: () => void;
}

export function AIModeContent({ onQuestionsGenerated, onCancel }: AIModeContentProps) {
  const [description, setDescription] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Por favor, descreva o tipo de checklist que deseja criar");
      return;
    }

    setIsGenerating(true);
    
    // Simular geração de perguntas por IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sampleQuestions: ChecklistQuestion[] = [
      {
        id: `ai-question-1`,
        text: "O equipamento está funcionando corretamente?",
        responseType: "yes_no",
        isRequired: true,
        order: 0,
        weight: 1,
        allowsPhoto: true,
        allowsVideo: false,
        allowsAudio: false,
        allowsFiles: false,
        options: [],
        hint: "Verificar se não há ruídos anômalos ou vazamentos",
        level: 0,
        path: `ai-question-1`,
        isConditional: false,
        groupId: "default"
      },
      {
        id: `ai-question-2`,
        text: "Observações gerais sobre a inspeção:",
        responseType: "text",
        isRequired: true,
        order: 1,
        weight: 1,
        allowsPhoto: true,
        allowsVideo: false,
        allowsAudio: false,
        allowsFiles: false,
        options: [],
        hint: "Descreva qualquer observação relevante",
        level: 0,
        path: `ai-question-2`,
        isConditional: false,
        groupId: "default"
      },
      {
        id: `ai-question-3`,
        text: "Qual o nível de risco identificado?",
        responseType: "multiple_choice",
        isRequired: true,
        order: 2,
        weight: 1,
        allowsPhoto: false,
        allowsVideo: false,
        allowsAudio: false,
        allowsFiles: false,
        options: ["Baixo", "Médio", "Alto", "Crítico"],
        hint: "Selecione o nível de risco apropriado",
        level: 0,
        path: `ai-question-3`,
        isConditional: false,
        groupId: "default"
      }
    ];

    setIsGenerating(false);
    onQuestionsGenerated(sampleQuestions);
    toast.success("Perguntas geradas com sucesso!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Gerar Checklist com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="description">Descreva o tipo de checklist que você quer criar</Label>
          <Textarea
            id="description"
            placeholder="Ex: Checklist de segurança para inspeção de equipamentos industriais..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="questionCount">Número de perguntas (aproximado)</Label>
          <Input
            id="questionCount"
            type="number"
            min="5"
            max="50"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="mt-2"
          />
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !description.trim()}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Checklist
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>

        {isGenerating && (
          <div className="text-sm text-muted-foreground text-center">
            Nossa IA está analisando sua descrição e criando perguntas personalizadas...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
