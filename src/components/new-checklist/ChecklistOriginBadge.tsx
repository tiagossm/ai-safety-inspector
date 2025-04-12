
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
          color: "text-blue-500",
        };
      case "ia":
        return {
          label: "IA",
          icon: Bot,
          variant: "outline" as const,
          color: "text-violet-500",
        };
      case "csv":
        return {
          label: "Importado",
          icon: FileSpreadsheet,
          variant: "outline" as const,
          color: "text-green-500",
        };
      default:
        return null;
    }
  };

  const config = getOriginConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.color} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {showLabel && config.label}
    </Badge>
  );
}
