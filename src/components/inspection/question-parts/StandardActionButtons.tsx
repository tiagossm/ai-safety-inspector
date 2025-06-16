
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, ClipboardEdit, Camera, MessageCircle } from "lucide-react";

export interface StandardActionButtonsProps {
  question: any;
  readOnly?: boolean;
  onOpenAnalysis?: () => void;
  onActionPlanClick?: () => void;
  onCommentClick?: () => void;
  onMediaClick?: () => void;
  mediaUrls?: string[];
  mediaAnalysisResults?: Record<string, any>;
  dummyProp?: string; // Para garantir re-renderização quando necessário
}

export function StandardActionButtons({
  question,
  readOnly = false,
  onOpenAnalysis,
  onActionPlanClick,
  onCommentClick,
  onMediaClick,
  mediaUrls = [],
  mediaAnalysisResults = {},
  dummyProp
}: StandardActionButtonsProps) {
  if (readOnly) return null;

  const hasMediaForAnalysis = mediaUrls && mediaUrls.length > 0;
  const hasAnalysisResults = Object.keys(mediaAnalysisResults).length > 0;

  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
      {/* Botão de Análise com IA */}
      {hasMediaForAnalysis && onOpenAnalysis && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenAnalysis}
          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          <Search className="h-3.5 w-3.5" />
          {hasAnalysisResults ? "Ver Análise IA" : "Analisar com IA"}
        </Button>
      )}

      {/* Botão de Plano de Ação */}
      {onActionPlanClick && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onActionPlanClick}
          className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
        >
          <ClipboardEdit className="h-3.5 w-3.5" />
          Plano de Ação
        </Button>
      )}

      {/* Botão de Comentário */}
      {onCommentClick && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCommentClick}
          className="flex items-center gap-1 text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Comentário
        </Button>
      )}

      {/* Botão de Mídia */}
      {onMediaClick && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onMediaClick}
          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
        >
          <Camera className="h-3.5 w-3.5" />
          {mediaUrls.length > 0 ? `Mídia (${mediaUrls.length})` : "Adicionar Mídia"}
        </Button>
      )}
    </div>
  );
}
