
import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

interface ActionPlanButtonProps {
  onActionPlanClick: () => void;
  readOnly?: boolean;
  isActionPlanOpen?: boolean;
  setIsActionPlanOpen?: (isOpen: boolean) => void;
}

export function ActionPlanButton({
  onActionPlanClick,
  readOnly = false,
  isActionPlanOpen,
  setIsActionPlanOpen,
}: ActionPlanButtonProps) {
  console.log('[ActionPlanButton] Renderizando. onActionPlanClick:', !!onActionPlanClick, 'readOnly:', readOnly);

  const handleClick = () => {
    if (setIsActionPlanOpen && isActionPlanOpen !== undefined) {
      setIsActionPlanOpen(!isActionPlanOpen);
    } else {
      onActionPlanClick();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="flex items-center"
      disabled={readOnly}
      data-testid="action-plan-btn"
      type="button"
    >
      <ClipboardList className="h-4 w-4 mr-1" />
      Criar Plano de Ação
    </Button>
  );
}
