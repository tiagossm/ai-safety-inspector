
import { Badge } from "@/components/ui/badge";
import { File, Bot, Upload } from "lucide-react";

interface ChecklistOriginBadgeProps {
  origin?: "manual" | "ia" | "csv";
  showLabel?: boolean;
  className?: string;
}

export function ChecklistOriginBadge({ 
  origin = "manual", 
  showLabel = true, 
  className = "" 
}: ChecklistOriginBadgeProps) {
  switch (origin) {
    case "manual":
      return (
        <Badge variant="outline" className={`bg-slate-100 ${className}`}>
          <File className="h-3 w-3 mr-1" />
          {showLabel && "Manual"}
        </Badge>
      );
    case "ia":
      return (
        <Badge variant="outline" className={`bg-purple-100 text-purple-800 border-purple-300 ${className}`}>
          <Bot className="h-3 w-3 mr-1" />
          {showLabel && "IA"}
        </Badge>
      );
    case "csv":
      return (
        <Badge variant="outline" className={`bg-blue-100 text-blue-800 border-blue-300 ${className}`}>
          <Upload className="h-3 w-3 mr-1" />
          {showLabel && "CSV"}
        </Badge>
      );
    default:
      return null;
  }
}
