
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCircle2, Circle, FileText, List, FileQuestion } from "lucide-react";

type ResponseType = "yes_no" | "text" | "multiple_choice" | "numeric" | "photo" | "signature";

interface ChecklistItemProps {
  title: string;
  type: string;
  required: boolean;
  order: number;
  hasSubchecklist?: boolean;
  options?: string[];
}

export function ChecklistItem({
  title,
  type,
  required,
  order,
  hasSubchecklist = false,
  options = [],
}: ChecklistItemProps) {
  const getTypeIcon = () => {
    switch (type) {
      case "yes_no":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "text":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "multiple_choice":
        return <List className="h-4 w-4 text-purple-600" />;
      case "numeric":
        return <span className="text-orange-600 font-bold">#</span>;
      case "photo":
        return <span className="text-cyan-600 font-bold">📷</span>;
      case "signature":
        return <span className="text-indigo-600 font-bold">✍️</span>;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "yes_no":
        return "Sim/Não";
      case "text":
        return "Texto";
      case "multiple_choice":
        return "Múltipla Escolha";
      case "numeric":
        return "Numérico";
      case "photo":
        return "Foto";
      case "signature":
        return "Assinatura";
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="h-6 w-6 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full text-sm">
          {order}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            {required && (
              <Badge variant="outline" className="text-xs text-red-500 border-red-200">
                Obrigatório
              </Badge>
            )}
            {hasSubchecklist && (
              <Badge variant="outline" className="text-xs text-blue-500 border-blue-200">
                <FileQuestion className="h-3 w-3 mr-1" />
                Sub-checklist
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              {getTypeIcon()}
              <span>{getTypeLabel()}</span>
            </div>
            
            {type === "multiple_choice" && options && options.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {options.map((option, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {option}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
