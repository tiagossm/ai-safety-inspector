
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
}

export function AIAnalysisButton({
  questionId,
  mediaUrls,
  questionText,
  onAnalysisComplete,
  disabled = false
}: AIAnalysisButtonProps) {
  const [analyzing, setAnalyzing] = useState(false);
  
  const handleAnalyze = async () => {
    if (analyzing) return;
    
    try {
      setAnalyzing(true);
      toast.info("Analisando mídia com IA...");
      
      // Simulate AI analysis (replace with actual API call in production)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate AI-based comment and action plan
      const comment = `Análise automática: Esta mídia mostra evidências relacionadas à questão "${questionText.substring(0, 50)}...".`;
      const actionPlan = questionText.includes("não") || questionText.includes("problema") ? 
        "Recomendamos verificar os procedimentos de segurança descritos no manual de operações." : 
        undefined;
      
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
      variant="outline"
      size="sm"
      disabled={disabled || analyzing || mediaUrls.length === 0}
      onClick={handleAnalyze}
      className="flex items-center"
    >
      <Brain className="h-4 w-4 mr-2" />
      <span>{analyzing ? "Analisando..." : "Analisar com IA"}</span>
    </Button>
  );
}
