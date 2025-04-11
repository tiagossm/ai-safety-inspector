
import React from "react";
import { Badge } from "@/components/ui/badge";

// Define allowed origin types that match the backend values
export type ChecklistOriginType = "manual" | "ia" | "csv" | string;

interface ChecklistOriginBadgeProps {
  origin: ChecklistOriginType;
}

export const ChecklistOriginBadge: React.FC<ChecklistOriginBadgeProps> = ({ origin }) => {
  // Map the backend origin values to user-friendly display names
  const getDisplayName = (origin: ChecklistOriginType) => {
    switch (origin) {
      case "manual":
        return "Manual";
      case "ia":
        return "IA";
      case "csv":
        return "Importado";
      default:
        return origin || "Manual";
    }
  };

  // Map the backend origin values to badge variants
  const getBadgeVariant = (origin: ChecklistOriginType): "outline" | "secondary" | "default" => {
    switch (origin) {
      case "ia":
        return "secondary";
      case "csv":
        return "outline";
      case "manual":
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getBadgeVariant(origin)} className="text-xs">
      {getDisplayName(origin)}
    </Badge>
  );
};
