
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";

interface ChecklistCardBadgesProps {
  checklist: ChecklistWithStats;
  status: string;
}

/**
 * Component for rendering checklist badges (status, template, origin)
 */
export const ChecklistCardBadges: React.FC<ChecklistCardBadgesProps> = ({ 
  checklist, 
  status 
}) => {
  // Determine badge text based on checklist properties
  const badgeText = checklist.isTemplate 
    ? "Template" 
    : status === 'active' 
      ? "Ativo" 
      : "Inativo";
  
  // Determine badge variant based on checklist type
  const badgeVariant = checklist.isTemplate ? "secondary" : "default";
  
  return (
    <div className="flex items-center gap-2 mb-1" aria-label="Status do checklist">
      <Badge 
        variant={badgeVariant} 
        className="px-2 py-0"
      >
        {badgeText}
      </Badge>
      <ChecklistOriginBadge origin={checklist.origin} />
    </div>
  );
};
