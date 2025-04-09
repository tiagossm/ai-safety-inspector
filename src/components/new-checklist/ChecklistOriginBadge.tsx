
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FilePenLine, Bot, FileSpreadsheet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChecklistOrigin } from "@/types/newChecklist";

interface ChecklistOriginBadgeProps {
  origin?: ChecklistOrigin;
  className?: string;
  showLabel?: boolean;
}

export const ChecklistOriginBadge = ({
  origin = "manual",
  className = "",
  showLabel = true
}: ChecklistOriginBadgeProps) => {
  const getOriginDetails = () => {
    switch (origin) {
      case 'manual':
        return {
          icon: <FilePenLine className="h-3 w-3" />,
          label: "Manual",
          tooltip: "Criado manualmente",
          classes: "bg-gray-100 text-gray-700 border-gray-200"
        };
      case 'ia':
        return {
          icon: <Bot className="h-3 w-3" />,
          label: "IA",
          tooltip: "Gerado por IA",
          classes: "bg-indigo-100 text-indigo-700 border-indigo-200"
        };
      case 'csv':
        return {
          icon: <FileSpreadsheet className="h-3 w-3" />,
          label: "Planilha",
          tooltip: "Importado de planilha",
          classes: "bg-emerald-100 text-emerald-700 border-emerald-200"
        };
      default:
        return {
          icon: <FilePenLine className="h-3 w-3" />,
          label: "Manual",
          tooltip: "Criado manualmente",
          classes: "bg-gray-100 text-gray-700 border-gray-200"
        };
    }
  };

  const { icon, label, tooltip, classes } = getOriginDetails();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`flex items-center gap-1 ${classes} ${className}`}>
            {icon}
            {showLabel && <span>{label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
