
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (mediaUrls.length === 0) {
      toast.error("Nenhuma mídia disponível para análise");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Here we would typically call an API to analyze the media
      // For now, we'll simulate a response
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate a contextual response based on the question text
      const questionLower = questionText.toLowerCase();
      let comment = "";
      let actionPlan = "";
      
      if (questionLower.includes("equipamento") || questionLower.includes("equipamentos")) {
        comment = "Análise IA: A imagem mostra equipamentos que parecem necessitar de manutenção. Observa-se desgaste em alguns componentes.";
        actionPlan = "Programar manutenção preventiva dos equipamentos identificados nas próximas 2 semanas e revisar procedimento de verificação diária.";
      } else if (questionLower.includes("segurança") || questionLower.includes("proteção")) {
        comment = "Análise IA: Identificados possíveis problemas nos equipamentos de proteção. Alguns itens podem não estar em conformidade com normas NR-6.";
        actionPlan = "Substituir imediatamente os equipamentos de proteção desgastados e realizar treinamento de reciclagem sobre uso correto de EPIs.";
      } else if (questionLower.includes("limpeza") || questionLower.includes("higiene")) {
        comment = "Análise IA: O ambiente aparenta precisar de melhoria nos procedimentos de limpeza. Áreas específicas requerem atenção especial.";
        actionPlan = "Revisar protocolo de limpeza e definir checklist diário para as áreas identificadas.";
      } else {
        comment = `Análise IA: A mídia anexada à questão "${questionText}" revela pontos de atenção que precisam ser verificados para garantir conformidade.`;
        actionPlan = "Recomenda-se uma inspeção detalhada por especialista para avaliar o status dos itens identificados.";
      }
      
      onAnalysisComplete(comment, actionPlan);
      toast.success("Análise de mídia concluída com sucesso");
    } catch (error) {
      console.error("Erro na análise de IA:", error);
      toast.error("Ocorreu um erro durante a análise. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAnalyze}
      disabled={disabled || isAnalyzing || mediaUrls.length === 0}
      className="flex items-center gap-2"
    >
      {isAnalyzing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      <span>
        {isAnalyzing ? "Analisando..." : "Analisar com IA"}
      </span>
    </Button>
  );
}
