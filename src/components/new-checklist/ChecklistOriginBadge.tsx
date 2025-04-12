import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { File, Bot, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChecklistOriginBadgeProps {
  origin?: "manual" | "ia" | "csv";
  showLabel?: boolean;
  className?: string;
}

export const ChecklistOriginBadge = forwardRef<HTMLDivElement, ChecklistOriginBadgeProps>(
  ({ origin = "manual", showLabel = true, className = "", ...props }, ref) => {
    const getContent = () => {
      let icon = <File className="h-3 w-3 mr-1" />;
      let label = "Manual";
      let badgeClass = "bg-slate-100";

      if (origin === "ia") {
        icon = <Bot className="h-3 w-3 mr-1" />;
        label = "IA";
        badgeClass = "bg-purple-100 text-purple-800 border-purple-300";
      } else if (origin === "csv") {
        icon = <Upload className="h-3 w-3 mr-1" />;
        label = "CSV";
        badgeClass = "bg-blue-100 text-blue-800 border-blue-300";
      }

      return (
        <Badge
          ref={ref}
          variant="outline"
          className={cn("flex items-center", badgeClass, className)}
          {...props}
        >
          {icon}
          {showLabel && label}
        </Badge>
      );
    };

    if (showLabel) return getContent();

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{getContent()}</TooltipTrigger>
          <TooltipContent>
            <p>
              {origin === "manual"
                ? "Criação Manual"
                : origin === "ia"
                ? "Gerado por IA"
                : "Importado via CSV"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

ChecklistOriginBadge.displayName = "ChecklistOriginBadge";
