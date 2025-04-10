
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChecklistOrigin } from "@/types/newChecklist";
import { FileText, Bot, Upload } from "lucide-react";

interface ChecklistOriginBadgeProps {
  origin: ChecklistOrigin;
}

export function ChecklistOriginBadge({ origin }: ChecklistOriginBadgeProps) {
  // Safely handle origin values
  const safeOrigin = (origin || 'manual') as ChecklistOrigin;

  switch (safeOrigin) {
    case "manual":
      return (
        <Badge 
          variant="outline" 
          className="bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1"
        >
          <FileText className="h-3 w-3" />
          <span>Manual</span>
        </Badge>
      );
    case "ia":
      return (
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
        >
          <Bot className="h-3 w-3" />
          <span>IA</span>
        </Badge>
      );
    case "csv":
      return (
        <Badge 
          variant="outline" 
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
        >
          <Upload className="h-3 w-3" />
          <span>CSV</span>
        </Badge>
      );
    default:
      return (
        <Badge 
          variant="outline" 
          className="bg-slate-50 text-slate-700 border-slate-200"
        >
          <FileText className="h-3 w-3 mr-1" />
          Manual
        </Badge>
      );
  }
}
