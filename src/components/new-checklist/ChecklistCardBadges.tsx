
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats } from "@/types/newChecklist";

interface ChecklistCardBadgesProps {
  checklist: ChecklistWithStats;
  status: "active" | "inactive";
}

export function ChecklistCardBadges({ checklist, status }: ChecklistCardBadgesProps) {
  return (
    <div className="flex items-center gap-1">
      {checklist.is_template && (
        <Badge variant="secondary" className="text-xs font-normal">
          Template
        </Badge>
      )}

      {status === "inactive" && (
        <Badge variant="outline" className="text-xs font-normal border-red-200 text-red-500 bg-red-50">
          Inativo
        </Badge>
      )}

      {status === "active" && (
        <Badge variant="outline" className="text-xs font-normal border-green-200 text-green-600 bg-green-50">
          Ativo
        </Badge>
      )}
    </div>
  );
}
