
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { ChecklistThemeBadge } from "./ChecklistThemeBadge";

interface ChecklistCardBadgesProps {
  checklist: ChecklistWithStats;
  status: string;
}

/**
 * Component for rendering checklist badges (status, template, origin, theme)
 */
export const ChecklistCardBadges: React.FC<ChecklistCardBadgesProps> = ({ 
  checklist, 
  status 
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-1">
      <Badge variant={checklist.isTemplate ? "secondary" : "default"} className="px-2 py-0">
        {checklist.isTemplate ? "Template" : status === 'active' ? "Ativo" : "Inativo"}
      </Badge>
      {/* Cast the origin to the expected type */}
      <ChecklistOriginBadge origin={checklist.origin as "manual" | "ia" | "csv" | undefined} />
      {checklist.theme && <ChecklistThemeBadge theme={checklist.theme} />}
    </div>
  );
};
