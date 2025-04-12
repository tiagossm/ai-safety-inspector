
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats } from "@/types/newChecklist";
import { PencilRuler, Copy, Bookmark, Users } from "lucide-react";

interface ChecklistCardBadgesProps {
  checklist: ChecklistWithStats;
}

export function ChecklistCardBadges({ checklist }: ChecklistCardBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 my-2">
      {checklist.isTemplate && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Copy className="h-3 w-3" />
          <span>Template</span>
        </Badge>
      )}

      {checklist.category && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Bookmark className="h-3 w-3" />
          <span>{checklist.category}</span>
        </Badge>
      )}

      {checklist.responsibleId && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Responsável atribuído</span>
        </Badge>
      )}

      {checklist.origin && (
        <OriginBadge origin={checklist.origin as "manual" | "ia" | "csv"} />
      )}
    </div>
  );
}

function OriginBadge({ origin }: { origin: "manual" | "ia" | "csv" }) {
  let label = "";
  let icon = null;
  
  switch (origin) {
    case "manual":
      label = "Criação Manual";
      icon = <PencilRuler className="h-3 w-3" />;
      break;
    case "ia":
      label = "Gerado por IA";
      icon = <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v8m0 4v8M4 12h16M7 5h10M7 19h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>;
      break;
    case "csv":
      label = "Importado de CSV";
      icon = <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 13h4m-4 4h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>;
      break;
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      {icon}
      <span>{label}</span>
    </Badge>
  );
}
