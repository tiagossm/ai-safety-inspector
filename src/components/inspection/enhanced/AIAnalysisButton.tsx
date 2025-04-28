
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { toast } from "sonner";

interface AIAnalysisButtonProps {
  questionId: string;
  mediaUrls: string[];
  questionText: string;
  onAnalysisComplete: (comment: string, actionPlan?: string) => void;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function AIAnalysisButton({
  questionId,
  mediaUrls,
  questionText,
  onAnalysisComplete,
  disabled = false,
  size = "sm",
  variant = "outline"
}: AIAnalysisButtonProps) {
  const [analyzing, setAnalyzing] = useState(false);
  
  const handleAnalyze = async () => {
    if (analyzing || disabled || mediaUrls.length === 0) return;
    
    try {
      setAnalyzing(true);
      toast.info("Analisando mídia com IA...");
      
      // Simulação de análise de IA (em produção, seria substituído por uma chamada API real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate AI-based comment based on question text
      let comment = '';
      let actionPlan = undefined;
      
      const isNegativeQuestion = questionText.toLowerCase().includes("problema") || 
                                 questionText.toLowerCase().includes("não") ||
                                 questionText.toLowerCase().includes("dificuldade");
      
      if (isNegativeQuestion) {
        comment = `Análise automática: As imagens indicam um possível problema relacionado à questão "${questionText.substring(0, 50)}..."`;
        actionPlan = "Recomendamos verificar os procedimentos de segurança descritos no manual de operações e realizar nova inspeção em 7 dias.";
      } else {
        comment = `Análise automática: As imagens confirmam a conformidade em relação à questão "${questionText.substring(0, 50)}..."`;
      }
      
      onAnalysisComplete(comment, actionPlan);
      toast.success("Análise de IA concluída com sucesso");
    } catch (error: any) {
      console.error("AI analysis error:", error);
      toast.error(`Erro na análise de IA: ${error.message || "Erro desconhecido"}`);
    } finally {
      setAnalyzing(false);
    }
  };
  
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || analyzing || mediaUrls.length === 0}
      onClick={handleAnalyze}
      className="flex items-center"
    >
      <Brain className="h-4 w-4 mr-2" />
      <span>{analyzing ? "Analisando..." : "Analisar com IA"}</span>
    </Button>
  );
}
