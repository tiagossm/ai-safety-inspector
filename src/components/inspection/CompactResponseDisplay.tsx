
import React from 'react';
import { SimpleThumbnailRenderer } from '@/components/media/renderers/SimpleThumbnailRenderer';

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
  
  const formattedValue = formatResponseValue(question, responseValue);
  
  return (
    <div className="space-y-1.5">
      {/* Resposta principal - layout inline otimizado */}
      <div className="flex items-start gap-3">
        <span className="text-muted-foreground text-xs font-medium min-w-[60px] pt-0.5">Resposta:</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900">{formattedValue}</span>
        </div>
      </div>

      {/* Mídias - renderização inline compacta */}
      {mediaUrls.length > 0 && (
        <div className="flex items-start gap-3">
          <span className="text-muted-foreground text-xs font-medium min-w-[60px] pt-0.5">Mídias:</span>
          <div className="flex-1 min-w-0">
            <SimpleThumbnailRenderer
              urls={mediaUrls}
              onOpenPreview={onOpenPreview}
              maxItems={4}
            />
          </div>
        </div>
      )}

      {/* Comentários */}
      {comment && (
        <div className="flex items-start gap-3">
          <span className="text-muted-foreground text-xs font-medium min-w-[60px] pt-0.5">Observ.:</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-700 leading-relaxed">{comment}</p>
          </div>
        </div>
      )}
    </div>
  );
}
