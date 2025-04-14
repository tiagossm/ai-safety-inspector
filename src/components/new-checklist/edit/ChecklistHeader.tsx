
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, PlayCircle, Save, FilePlus2 } from "lucide-react";

interface ChecklistHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  onStartInspection: () => void;
  onSave: () => void;
  onEnableAllMedia?: () => void;
  enableAllMedia?: boolean;
}

export function ChecklistHeader({ 
  onBack, 
  onRefresh, 
  onStartInspection, 
  onSave,
  onEnableAllMedia,
  enableAllMedia = false
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
        <h1 className="text-2xl font-bold">Editar Checklist</h1>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {onEnableAllMedia && (
          <Button
            variant={enableAllMedia ? "default" : "outline"}
            size="sm"
            onClick={onEnableAllMedia}
            className="flex items-center gap-1"
            title="Ativar opções de mídia em todas as perguntas"
          >
            <FilePlus2 className="h-4 w-4" />
            <span className="hidden sm:inline">Ativar mídias em todas as perguntas</span>
            <span className="inline sm:hidden">Ativar mídias</span>
          </Button>
        )}
        
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
