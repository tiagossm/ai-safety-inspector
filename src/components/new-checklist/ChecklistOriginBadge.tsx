
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, Bot, FileSpreadsheet } from "lucide-react";

interface ChecklistOriginBadgeProps {
  origin?: 'manual' | 'ia' | 'csv';
  className?: string;
  showLabel?: boolean;
}

export const ChecklistOriginBadge = ({
  origin,
  className = "",
  showLabel = true
}: ChecklistOriginBadgeProps) => {
  if (!origin) return null;

  switch (origin) {
    case 'manual':
      return (
        <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
          <FileText className="h-3 w-3" />
          {showLabel && <span>Manual</span>}
        </Badge>
      );
    case 'ia':
      return (
        <Badge variant="outline" className={`flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 ${className}`}>
          <Bot className="h-3 w-3" />
          {showLabel && <span>IA</span>}
        </Badge>
      );
    case 'csv':
      return (
        <Badge variant="outline" className={`flex items-center gap-1 bg-green-50 text-green-700 border-green-200 ${className}`}>
          <FileSpreadsheet className="h-3 w-3" />
          {showLabel && <span>Planilha</span>}
        </Badge>
      );
    default:
      return null;
  }
};
