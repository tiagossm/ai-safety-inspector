
import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface MediaAnalysisButtonProps {
  onOpenAnalysis: () => void;
}

export function MediaAnalysisButton({ onOpenAnalysis }: MediaAnalysisButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onOpenAnalysis}
      className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      type="button"
    >
      <Search className="h-3.5 w-3.5 mr-1" />
      Analisar com IA
    </Button>
  );
}
