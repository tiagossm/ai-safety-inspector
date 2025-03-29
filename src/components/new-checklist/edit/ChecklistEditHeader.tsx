
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ChecklistEditHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
}

export function ChecklistEditHeader({ onBack, onRefresh }: ChecklistEditHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost"
          size="icon"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Checklist</h1>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="flex items-center gap-1"
      >
        <Loader2 className="h-4 w-4" />
        <span>Recarregar</span>
      </Button>
    </div>
  );
}
