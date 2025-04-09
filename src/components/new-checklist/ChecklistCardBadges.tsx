
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";
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
  return (
    <div className="flex items-center gap-2 mb-1">
      <Badge variant={checklist.isTemplate ? "secondary" : "default"} className="px-2 py-0">
        {checklist.isTemplate ? "Template" : status === 'active' ? "Ativo" : "Inativo"}
      </Badge>
      <ChecklistOriginBadge origin={checklist.origin as ChecklistOrigin} />
    </div>
  );
};
