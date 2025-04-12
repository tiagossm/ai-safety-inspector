
import { Badge } from "@/components/ui/badge";
import { File, Bot, Upload, Check, X } from "lucide-react";

type Origin = "manual" | "ia" | "csv";

interface ChecklistCardBadgesProps {
  isTemplate?: boolean;
  status?: string;
  origin?: string;
}

export function ChecklistCardBadges({ isTemplate, status, origin }: ChecklistCardBadgesProps) {
  const getOriginBadge = () => {
    // Map string origin to allowed Origin type
    let safeOrigin: Origin = "manual";
    
    if (origin === "ia") {
      safeOrigin = "ia";
    } else if (origin === "csv") {
      safeOrigin = "csv";
    }
    
    switch (safeOrigin) {
      case "manual":
        return (
          <Badge variant="outline" className="bg-slate-100">
            <File className="h-3 w-3 mr-1" />
            Manual
          </Badge>
        );
      case "ia":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            <Bot className="h-3 w-3 mr-1" />
            IA
          </Badge>
        );
      case "csv":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <Upload className="h-3 w-3 mr-1" />
            CSV
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (isTemplate) {
      return (
        <Badge variant="secondary">
          Template
        </Badge>
      );
    }

    const badgeProps =
      status === "active"
        ? {
          variant: "default" as "default",
          className: "bg-green-100 text-green-800 border-green-300",
          text: "Ativo",
        }
        : {
          variant: "outline" as "outline",
          className: "bg-gray-100 text-gray-600 border-gray-300",
          text: "Inativo",
        };

    return (
      <Badge variant={badgeProps.variant} className={badgeProps.className}>
        {badgeProps.text}
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {getOriginBadge()}
      {getStatusBadge()}
    </div>
  );
}
