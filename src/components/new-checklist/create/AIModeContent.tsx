
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "@/components/new-checklist/question-editor/QuestionEditor";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface AIModeContentProps {
  onQuestionsGenerated: (questions: ChecklistQuestion[]) => void;
  onCancel: () => void;
}

export function AIModeContent({ onQuestionsGenerated, onCancel }: AIModeContentProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<ChecklistQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, descreva o tipo de checklist que deseja criar");
      return;
    }

    setIsGenerating(true);
    try {
      // Simular geração de perguntas por IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockQuestions: ChecklistQuestion[] = [
        {
          id: `q-${Date.now()}-1`,
          text: "O equipamento está funcionando corretamente?",
          responseType: "yes_no",
          isRequired: true,
          order: 1,
          weight: 1,
          allowsPhoto: true,
          allowsVideo: false,
          allowsAudio: false,
          allowsFiles: false,
          options: [],
          hint: "Verifique se não há ruídos estranhos ou vibração excessiva"
        },
        {
          id: `q-${Date.now()}-2`,
          text: "Descreva as condições observadas",
          responseType: "text",
          isRequired: true,
          order: 2,
          weight: 1,
          allowsPhoto: true,
          allowsVideo: false,
          allowsAudio: false,
          allowsFiles: false,
          options: [],
          hint: "Seja específico sobre o que foi observado"
        },
        {
          id: `q-${Date.now()}-3`,
          text: "Qual o nível de prioridade?",
          responseType: "multiple_choice",
          isRequired: true,
          order: 3,
          weight: 2,
          allowsPhoto: false,
          allowsVideo: false,
          allowsAudio: false,
          allowsFiles: false,
          options: ["Baixa", "Média", "Alta", "Crítica"],
          hint: "Selecione baseado na urgência da situação"
        }
      ];

      setGeneratedQuestions(mockQuestions);
      toast.success("Perguntas geradas com sucesso!");
      setIsEditing(true);
    } catch (error) {
      console.error("Erro ao gerar perguntas:", error);
      toast.error("Erro ao gerar perguntas. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuestionUpdate = (updatedQuestion: ChecklistQuestion) => {
    setGeneratedQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
  };

  const handleQuestionDelete = (questionId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleConfirm = () => {
    if (generatedQuestions.length === 0) {
      toast.error("Nenhuma pergunta foi gerada");
      return;
    }
    onQuestionsGenerated(generatedQuestions);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Revisar e Editar Perguntas</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Voltar
            </Button>
            <Button onClick={handleConfirm}>
              Confirmar Perguntas
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {generatedQuestions.map((question) => (
            <QuestionEditor
              key={question.id}
              question={question}
              onUpdate={handleQuestionUpdate}
              onDelete={handleQuestionDelete}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Gerar Checklist com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Descreva o tipo de checklist que você quer criar
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Checklist de segurança para inspeção de equipamentos industriais, incluindo verificações de funcionamento, condições de segurança e manutenção preventiva..."
              rows={6}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Perguntas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
