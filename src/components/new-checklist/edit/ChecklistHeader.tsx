
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, PlayCircle, Save } from "lucide-react";
import { QuestionCounter } from "./QuestionCounter";

interface ChecklistHeaderProps {
  totalQuestions?: number;
  totalGroups?: number;
  onBack: () => void;
  onRefresh: () => void;
  onStartInspection: () => void;
  onSave: () => void;
}

export function ChecklistHeader({ 
  totalQuestions = 0,
  totalGroups = 0,
  onBack, 
  onRefresh, 
  onStartInspection, 
  onSave
}: ChecklistHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost"
          size="icon"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-2xl font-bold">Editar Checklist</h1>
          <QuestionCounter totalQuestions={totalQuestions} totalGroups={totalGroups} />
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="flex items-center gap-1"
        >
          <Loader2 className="h-4 w-4" />
          <span>Recarregar</span>
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={onSave}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          <span>Salvar</span>
        </Button>
        
        <Button 
          size="sm"
          onClick={onStartInspection}
          className="flex items-center gap-1"
        >
          <PlayCircle className="h-4 w-4" />
          <span>Iniciar Inspeção</span>
        </Button>
      </div>
    </div>
  );
}
