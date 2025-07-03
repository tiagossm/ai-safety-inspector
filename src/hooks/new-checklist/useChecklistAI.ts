
import { useState } from "react";

export function useChecklistAI() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Funcionalidade de IA removida conforme solicitado
  const generateQuestions = async (prompt: string, numQuestions: number) => {
    setIsGenerating(true);
    
    try {
      // Simulação removida - funcionalidade de IA desabilitada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      throw new Error("Funcionalidade de IA foi removida");
    } catch (error) {
      console.error("IA desabilitada:", error);
      throw new Error("Funcionalidade de IA não está disponível");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateQuestions,
    isGenerating
  };
}
