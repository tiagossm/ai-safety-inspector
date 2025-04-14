
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion } from "@/types/newChecklist";

interface SubitemGeneratorProps {
  questionId: string;
  questionText: string;
  onSubitemsGenerated: (subitems: ChecklistQuestion[], parentId: string) => void;
  maxSubitems: number;
  currentSubitemsCount: number;
}

export function SubitemGenerator({
  questionId,
  questionText,
  onSubitemsGenerated,
  maxSubitems = 5,
  currentSubitemsCount = 0
}: SubitemGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoPrompt, setAutoPrompt] = useState("");
  const remainingSubitems = maxSubitems - currentSubitemsCount;

  // Generate an automatic prompt based on the parent question
  useEffect(() => {
    if (questionText && questionText.trim().length > 10) {
      const generateAutoPrompt = () => {
        // Remove question marks and create a prompt based on the question text
        const cleanText = questionText.replace(/\?/g, '').trim();
        
        if (cleanText.toLowerCase().includes("procedimento") || cleanText.toLowerCase().includes("processo")) {
          return `Detalhe os passos específicos para ${cleanText}`;
        } else if (cleanText.toLowerCase().includes("risco") || cleanText.toLowerCase().includes("perigo")) {
          return `Identifique fatores de risco relacionados a ${cleanText}`;
        } else if (cleanText.toLowerCase().includes("prevenção") || cleanText.toLowerCase().includes("programa")) {
          return `Liste os principais componentes para um programa efetivo de ${cleanText}`;
        } else {
          return `Quais os pontos principais a serem verificados sobre ${cleanText}`;
        }
      };

      setAutoPrompt(generateAutoPrompt());
      // Pre-fill the prompt input with the auto-generated prompt
      if (!prompt) {
        setPrompt(generateAutoPrompt());
      }
    }
  }, [questionText, prompt]);

  const handleGenerateSubitems = async () => {
    if (remainingSubitems <= 0) {
      toast.error(`Limite máximo de ${maxSubitems} subitens atingido.`);
      return;
    }

    if (!prompt.trim()) {
      toast.error("Por favor, insira um prompt para gerar subitens.");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sub-checklist", {
        body: {
          prompt: prompt,
          parentQuestionId: questionId,
          parentQuestionText: questionText,
          questionCount: Math.min(remainingSubitems, 5)
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success || !data?.subChecklist?.questions) {
        throw new Error("Falha ao gerar subitens. Tente novamente.");
      }

      // Transform the generated questions to match the ChecklistQuestion type
      const generatedQuestions: ChecklistQuestion[] = data.subChecklist.questions.map((q: any, index: number) => ({
        id: `new-${Date.now()}-${index}`,
        text: q.text,
        responseType: q.responseType || "yes_no",
        isRequired: q.isRequired !== false,
        options: Array.isArray(q.options) ? q.options.map(String) : [],
        weight: q.weight || 1,
        allowsPhoto: q.allowsPhoto || false,
        allowsVideo: q.allowsVideo || false,
        allowsAudio: q.allowsAudio || false,
        allowsFiles: q.allowsFiles || false,
        order: index,
        parentQuestionId: questionId,
        groupId: null
      }));

      onSubitemsGenerated(generatedQuestions, questionId);
      setPrompt("");
      toast.success(`${generatedQuestions.length} subitens gerados com sucesso.`);
    } catch (err: any) {
      toast.error(`Erro ao gerar subitens: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2 mb-4">
      <div className="text-sm text-muted-foreground mb-1">
        Gere até {remainingSubitems} subitens para esta pergunta usando IA
        {autoPrompt && <span className="text-xs block text-primary-foreground/70">Sugestão: {autoPrompt}</span>}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Digite um prompt para gerar subitens (ex: Detalhes sobre segurança em altura)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating || remainingSubitems <= 0}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateSubitems}
          disabled={isGenerating || remainingSubitems <= 0 || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar com IA
            </>
          )}
        </Button>
      </div>
      {remainingSubitems <= 0 && (
        <p className="text-xs text-amber-600">
          Limite máximo de {maxSubitems} subitens atingido.
        </p>
      )}
    </div>
  );
}
