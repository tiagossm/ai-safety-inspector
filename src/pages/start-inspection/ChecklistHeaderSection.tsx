
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface ChecklistHeaderSectionProps {
  checklist: any;
  draftSaved: Date | null;
  debugMode: boolean;
  debugClickCount: number;
  handleHeaderClick: () => void;
}

export default function ChecklistHeaderSection({
  checklist,
  draftSaved,
  debugMode,
  debugClickCount,
  handleHeaderClick,
}: ChecklistHeaderSectionProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight cursor-pointer"
          onClick={handleHeaderClick}
        >
          Iniciar Inspeção
        </h1>
        <p className="text-muted-foreground">
          Preencha os dados necessários para iniciar a inspeção
        </p>
      </div>
      <div className="flex items-center gap-2">
        {draftSaved && (
          <Badge variant="outline" className="text-xs">
            <Check className="w-3 h-3 mr-1" />
            Salvo {draftSaved.toLocaleTimeString()}
          </Badge>
        )}
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
          {checklist.isTemplate ? "Template" : "Checklist"}
        </Badge>
      </div>
    </div>
  );
}
