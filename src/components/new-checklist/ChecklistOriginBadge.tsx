import { Badge } from "@/components/ui/badge";
import { File, Bot, Upload } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const getOriginContent = () => {
    switch (origin) {
      case "manual":
        return (
          <Badge variant="outline" className={`bg-gray-100 text-gray-800 border-gray-300 ${className}`}>
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
          <Badge variant="outline" className={`bg-green-100 text-green-800 border-green-300 ${className}`}>
            <Upload className="h-3 w-3 mr-1" />
            {showLabel && "CSV"}
          </Badge>
        );
      default:
        return null;
    }
  };

  // If showLabel is true, just return the badge with the label
  if (showLabel) {
    return getOriginContent();
  }

  // Otherwise, wrap the badge with a tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {getOriginContent()}
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {origin === "manual" ? "Criação Manual" : 
             origin === "ia" ? "Gerado por IA" : 
             "Importado de CSV"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
