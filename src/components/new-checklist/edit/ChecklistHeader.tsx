
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, PlayCircle, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";

interface ChecklistHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  onStartInspection: () => Promise<void>;
  onSave: () => Promise<void>;
}

export function ChecklistHeader({ 
  onBack, 
  onRefresh, 
  onStartInspection,
  onSave
}: ChecklistHeaderProps) {
  const { 
    isSubmitting,
    enableAllMedia,
    toggleAllMediaOptions
  } = useChecklistEditor();
  
  return (
    <>
      {/* Header with back button */}
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
      
      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Switch
            id="all-media-options"
            checked={enableAllMedia}
            onCheckedChange={toggleAllMediaOptions}
          />
          <label htmlFor="all-media-options" className="text-sm font-medium">
            Ativar todas as opções de mídia
          </label>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={onSave}
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Salvar Checklist</>
            )}
          </Button>
          
          <Button 
            onClick={onStartInspection}
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            Iniciar Inspeção
          </Button>
        </div>
      </div>
    </>
  );
}
