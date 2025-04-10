
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChecklistOrigin } from "@/types/newChecklist";
import { FileText, Bot, FileSpreadsheet } from "lucide-react";

interface ChecklistOriginBadgeProps {
  origin: ChecklistOrigin;
  showLabel?: boolean;
  className?: string;
}

export function ChecklistOriginBadge({ 
  origin, 
  showLabel = true,
  className = ""
}: ChecklistOriginBadgeProps) {
  const getOriginLabel = (origin: ChecklistOrigin): string => {
    switch (origin) {
      case 'manual':
        return 'Manual';
      case 'ia':
        return 'IA';
      case 'csv':
        return 'Importado';
      default:
        return 'Manual';
    }
  };
  
  const getOriginIcon = (origin: ChecklistOrigin) => {
    switch (origin) {
      case 'manual':
        return <FileText className="h-3.5 w-3.5" />;
      case 'ia':
        return <Bot className="h-3.5 w-3.5" />;
      case 'csv':
        return <FileSpreadsheet className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };
  
  const getOriginVariant = (origin: ChecklistOrigin): "default" | "outline" | "secondary" | "destructive" => {
    switch (origin) {
      case 'manual':
        return 'outline';
      case 'ia':
        return 'secondary';
      case 'csv':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  return (
    <Badge 
      variant={getOriginVariant(origin)} 
      className={`flex items-center gap-1 text-xs font-normal ${className}`}
    >
      {getOriginIcon(origin)}
      {showLabel && <span>{getOriginLabel(origin)}</span>}
    </Badge>
  );
}
