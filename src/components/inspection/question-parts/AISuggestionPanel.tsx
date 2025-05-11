
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AISuggestionPanelProps {
  suggestion: string;
  onApply: () => void;
}

export function AISuggestionPanel({ suggestion, onApply }: AISuggestionPanelProps) {
  return (
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-center mb-2">
        <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
        <span className="text-sm font-medium text-amber-700">Sugestão da IA</span>
      </div>
      <p className="text-sm mb-3 text-amber-800">{suggestion}</p>
      <Button
        size="sm"
        variant="outline"
        className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300"
        onClick={onApply}
        type="button"
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Aplicar esta sugestão
      </Button>
    </div>
  );
}
