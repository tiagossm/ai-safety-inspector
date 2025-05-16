
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActionPlanSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionPlan?: string | null;
  onActionPlanChange: (actionPlan: string) => void;
  onOpenDialog?: () => void;
  hasNegativeResponse?: boolean;
  aiSuggestion?: string;
  mediaAnalysisResults?: Record<string, any>;
}

export function ActionPlanSection({
  isOpen,
  onOpenChange,
  actionPlan = "",
  onActionPlanChange,
  onOpenDialog,
  hasNegativeResponse = false,
  aiSuggestion,
  mediaAnalysisResults = {}
}: ActionPlanSectionProps) {
  // Se houver resposta negativa ou plano de ação existente, sempre mostrar o componente
  if (!isOpen && !actionPlan && !hasNegativeResponse) return null;

  // Função para alternar a visibilidade
  const toggleOpen = () => {
    onOpenChange(!isOpen);
  };

  // Tratamento da alteração do plano de ação
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onActionPlanChange(e.target.value);
  };

  // Aplicar a sugestão da IA ao plano de ação
  const handleApplySuggestion = () => {
    if (aiSuggestion) {
      onActionPlanChange(aiSuggestion);
    }
  };

  // Função para abrir o diálogo completo quando disponível
  const handleOpenFullDialog = () => {
    if (onOpenDialog) {
      onOpenDialog();
    }
  };

  // Se está fechado mas tem um plano de ação, mostrar resumo
  if (!isOpen && actionPlan) {
    return (
      <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200 cursor-pointer" onClick={toggleOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
            <h4 className="text-sm font-medium text-amber-700">Plano de Ação</h4>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700">
            Ver detalhes
          </Badge>
        </div>
        <p className="text-sm mt-2 text-amber-800 line-clamp-2">{actionPlan}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
          <h4 className="text-sm font-medium text-amber-700">Plano de Ação</h4>
        </div>
        <div className="flex items-center gap-2">
          {onOpenDialog && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 border-amber-400"
              onClick={handleOpenFullDialog}
            >
              Plano Detalhado
            </Button>
          )}
          {actionPlan && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={toggleOpen}
            >
              Ocultar
            </Button>
          )}
        </div>
      </div>

      <textarea
        className="w-full border rounded p-2 text-sm mt-2"
        rows={5}
        placeholder="Descreva as ações necessárias para corrigir esta não conformidade"
        value={actionPlan || ""}
        onChange={handleChange}
      />

      {aiSuggestion && (
        <div className="mt-3 p-2 bg-amber-100 border border-amber-300 rounded-md">
          <div className="flex items-center mb-1">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Sugestão da IA</span>
          </div>
          <p className="text-xs text-amber-800 mb-2">{aiSuggestion}</p>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full h-7 text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 border-amber-400"
            onClick={handleApplySuggestion}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Aplicar esta sugestão
          </Button>
        </div>
      )}
    </div>
  );
}
