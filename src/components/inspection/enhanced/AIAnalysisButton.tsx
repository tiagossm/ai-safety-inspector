
import { useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const analyzeMedia = async () => {
    if (!mediaUrls.length) {
      toast.error("Não há mídias para analisar");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Get the first image URL to analyze (could be enhanced to support multiple)
      const mediaUrl = mediaUrls[0];
      
      // Call our edge function that will use OpenAI's API
      const { data, error } = await supabase.functions.invoke("analyze-inspection-media", {
        body: {
          mediaUrl,
          questionText,
          questionId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.analysis) {
        // Update the inspection with AI analysis
        toast.success("Análise concluída com sucesso");
        onAnalysisComplete(
          data.analysis.comment || "Sem comentários da análise de IA.", 
          data.analysis.actionPlan
        );
      } else {
        toast.warning("A análise não retornou resultados");
      }
    } catch (error: any) {
      console.error("Error analyzing media:", error);
      toast.error(`Erro na análise de mídia: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={analyzeMedia}
      disabled={disabled || isAnalyzing || !mediaUrls.length}
      className="flex items-center gap-2"
    >
      {isAnalyzing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Brain className="h-4 w-4" />
      )}
      Analisar com IA
    </Button>
  );
}
