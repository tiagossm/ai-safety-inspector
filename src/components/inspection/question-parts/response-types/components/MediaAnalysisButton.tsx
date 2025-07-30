
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface MediaAnalysisButtonProps {
  onOpenAnalysis: () => void;
  canRetry?: boolean;
  analyzing?: boolean;
}

export function MediaAnalysisButton({ onOpenAnalysis, canRetry = false, analyzing = false }: MediaAnalysisButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onOpenAnalysis}
      disabled={analyzing}
      className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 disabled:opacity-50"
      type="button"
    >
      {analyzing ? (
        <RotateCcw className="h-3.5 w-3.5 mr-1 animate-spin" />
      ) : (
        <Search className="h-3.5 w-3.5 mr-1" />
      )}
      {canRetry ? "Tentar Novamente" : analyzing ? "Analisando..." : "Analisar com IA"}
    </Button>
  );
}
