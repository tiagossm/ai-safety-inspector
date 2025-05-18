import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

interface ActionPlanButtonProps {
  onActionPlanClick?: () => void;
  readOnly?: boolean;
}

export function ActionPlanButton({ onActionPlanClick, readOnly = false }: ActionPlanButtonProps) {
  // LOG para identificar se está sendo renderizado!
  console.log("Renderizando ActionPlanButton");

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onActionPlanClick}
      className="flex items-center"
      disabled={readOnly}
      data-testid="action-plan-btn"
    >
      <ClipboardList className="h-4 w-4 mr-1" />
      Criar Plano de Ação
    </Button>
  );
}
