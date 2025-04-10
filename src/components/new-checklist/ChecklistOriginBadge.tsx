
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChecklistOrigin } from "@/types/newChecklist";
import { FileText, Bot, Upload } from "lucide-react";

interface ChecklistOriginBadgeProps {
  origin: ChecklistOrigin;
  showLabel?: boolean; // Add the showLabel prop
  className?: string; // Add the className prop
}

export function ChecklistOriginBadge({ 
  origin, 
  showLabel = true, // Default to true
  className = ""
}: ChecklistOriginBadgeProps) {
  // Safely handle origin values
  const safeOrigin = (origin || 'manual') as ChecklistOrigin;

  switch (safeOrigin) {
    case "manual":
      return (
        <Badge 
          variant="outline" 
          className={`bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1 ${className}`}
        >
          <FileText className="h-3 w-3" />
          {showLabel && <span>Manual</span>}
        </Badge>
      );
    case "ia":
      return (
        <Badge 
          variant="outline" 
          className={`bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 ${className}`}
        >
          <Bot className="h-3 w-3" />
          {showLabel && <span>IA</span>}
        </Badge>
      );
    case "csv":
      return (
        <Badge 
          variant="outline" 
          className={`bg-green-50 text-green-700 border-green-200 flex items-center gap-1 ${className}`}
        >
          <Upload className="h-3 w-3" />
          {showLabel && <span>CSV</span>}
        </Badge>
      );
    default:
      return (
        <Badge 
          variant="outline" 
          className={`bg-slate-50 text-slate-700 border-slate-200 ${className}`}
        >
          <FileText className="h-3 w-3 mr-1" />
          {showLabel && <span>Manual</span>}
        </Badge>
      );
  }
}
