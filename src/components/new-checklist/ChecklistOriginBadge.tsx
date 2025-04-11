
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Brain, PenTool } from "lucide-react";

interface ChecklistOriginBadgeProps {
  origin?: string;
}

export const ChecklistOriginBadge: React.FC<ChecklistOriginBadgeProps> = ({ origin }) => {
  if (!origin) return null;
  
  // Handle the origin based on its value
  switch(origin) {
    case "manual":
      return (
        <Badge variant="outline" className="flex gap-1 items-center px-2 py-0.5 text-xs">
          <PenTool className="w-3 h-3" />
          <span>Manual</span>
        </Badge>
      );
    case "ia":
      return (
        <Badge variant="outline" className="flex gap-1 items-center px-2 py-0.5 text-xs bg-purple-50 text-purple-700 border-purple-200">
          <Brain className="w-3 h-3" />
          <span>IA</span>
        </Badge>
      );
    case "csv":
      return (
        <Badge variant="outline" className="flex gap-1 items-center px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border-blue-200">
          <FileSpreadsheet className="w-3 h-3" />
          <span>Planilha</span>
        </Badge>
      );
    default:
      // Handle any other origin value
      return (
        <Badge variant="outline" className="px-2 py-0.5 text-xs">
          {origin}
        </Badge>
      );
  }
};
