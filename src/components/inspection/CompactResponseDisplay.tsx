
import React from 'react';
import { MediaAttachmentRenderer } from '@/components/media/renderers/MediaAttachmentRenderer';

interface CompactResponseDisplayProps {
  question: any;
  response: any;
  onOpenPreview?: (url: string) => void;
  onOpenAnalysis?: (url: string, questionText?: string) => void;
}

const formatResponseValue = (question: any, value: any): string => {
  if (value === null || value === undefined) return "Não respondida";
  
  switch (question.tipo_resposta) {
    case 'sim_nao':
      return value === true || value === 'sim' || value === 'yes' ? 'Sim' : 'Não';
    case 'multipla_escolha':
    case 'dropdown':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    case 'data':
      if (value) {
        try {
          return new Date(value).toLocaleDateString('pt-BR');
        } catch {
          return String(value);
        }
      }
      return String(value);
    case 'data_hora':
      if (value) {
        try {
          return new Date(value).toLocaleString('pt-BR');
        } catch {
          return String(value);
        }
      }
      return String(value);
    case 'numero':
      return typeof value === 'number' ? value.toString() : String(value);
    default:
      return String(value);
  }
};

export function CompactResponseDisplay({ 
  question, 
  response, 
  onOpenPreview = () => {}, 
  onOpenAnalysis = () => {} 
}: CompactResponseDisplayProps) {
  const responseValue = response?.value;
  const mediaUrls = response?.mediaUrls || [];
  const comment = response?.comment || response?.comments || "";
  const mediaAnalysisResults = response?.mediaAnalysisResults || {};
  
  const formattedValue = formatResponseValue(question, responseValue);
  
  return (
    <div className="space-y-2">
      {/* Resposta principal */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-2">
        <span className="text-muted-foreground text-sm min-w-[70px]">Resposta:</span>
        <div className="flex-1">
          <span className="text-sm font-medium">{formattedValue}</span>
        </div>
      </div>

      {/* Mídias - renderização compacta */}
      {mediaUrls.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-start md:gap-2">
          <span className="text-muted-foreground text-xs min-w-[70px]">Mídias:</span>
          <div className="flex-1">
            <MediaAttachmentRenderer
              urls={mediaUrls}
              onOpenPreview={onOpenPreview}
              onOpenAnalysis={onOpenAnalysis}
              readOnly={true}
              questionText={question.text || question.pergunta}
              analysisResults={mediaAnalysisResults}
              smallSize={true}
            />
          </div>
        </div>
      )}

      {/* Comentários */}
      {comment && (
        <div className="flex flex-col md:flex-row md:items-start md:gap-2">
          <span className="text-muted-foreground text-xs min-w-[70px]">Observações:</span>
          <div className="flex-1">
            <p className="text-xs text-gray-800 leading-relaxed">{comment}</p>
          </div>
        </div>
      )}
    </div>
  );
}
