
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, FilePenLine, FileSpreadsheet } from "lucide-react";

interface ChecklistOriginBadgeProps {
  origin: "manual" | "ia" | "csv" | undefined;
  showLabel?: boolean;
  className?: string;
}

export function ChecklistOriginBadge({ origin, showLabel = true, className = "" }: ChecklistOriginBadgeProps) {
  if (!origin) return null;

  const getOriginConfig = () => {
    switch (origin) {
      case "manual":
        return {
          label: "Manual",
          icon: FilePenLine,
          variant: "outline" as const,
          color: "text-blue-600 bg-blue-50 border-blue-200",
        };
      case "ia":
        return {
          label: "IA",
          icon: Bot,
          variant: "outline" as const,
          color: "text-violet-600 bg-violet-50 border-violet-200",
        };
      case "csv":
        return {
          label: "Planilha",
          icon: FileSpreadsheet,
          variant: "outline" as const,
          color: "text-green-600 bg-green-50 border-green-200",
        };
      default:
        return null;
    }
  };

  const config = getOriginConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.color} ${className} flex items-center gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {showLabel && config.label}
    </Badge>
  );
}
