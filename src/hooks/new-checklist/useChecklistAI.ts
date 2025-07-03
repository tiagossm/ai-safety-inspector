
import { useState } from "react";
import { toast } from "sonner";

export function useChecklistAI() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuestions = async (prompt: string, numQuestions: number) => {
    setIsGenerating(true);
    
    try {
      // Simular chamada para API de IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar perguntas de exemplo baseadas no prompt
      const questions = Array.from({ length: numQuestions }, (_, index) => ({
        id: `ai-generated-${Date.now()}-${index}`,
        text: `Pergunta gerada por IA ${index + 1}: ${prompt.substring(0, 50)}...`,
        responseType: "yes_no" as const,
        isRequired: true,
        weight: 1,
        allowsPhoto: false,
        allowsVideo: false,
        allowsAudio: false,
        allowsFiles: false,
        order: 0, // Will be set by the caller
        groupId: "default"
      }));

      return questions;
    } catch (error) {
      console.error("Erro ao gerar perguntas com IA:", error);
      throw new Error("Falha ao gerar perguntas com IA");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateQuestions,
    isGenerating
  };
}
