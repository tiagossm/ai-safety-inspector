
import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

interface ActionPlanButtonProps {
  isActionPlanOpen: boolean;
  setIsActionPlanOpen: (isOpen: boolean) => void;
}

export function ActionPlanButton({
  isActionPlanOpen,
  setIsActionPlanOpen
}: ActionPlanButtonProps) {
  return (
    <Button
      variant={isActionPlanOpen ? "secondary" : "ghost"}
      size="sm"
      onClick={() => setIsActionPlanOpen(!isActionPlanOpen)}
      className="flex items-center"
    >
      <ClipboardList className="h-4 w-4 mr-1" />
      {isActionPlanOpen ? "Hide Action Plan" : "Action Plan"}
    </Button>
  );
}
