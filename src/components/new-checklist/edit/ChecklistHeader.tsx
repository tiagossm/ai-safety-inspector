
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Play, Save } from "lucide-react";

interface ChecklistHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  onStartInspection: () => void;
  onSave: () => void;
}

export function ChecklistHeader({
  onBack,
  onRefresh,
  onStartInspection,
  onSave
}: ChecklistHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Editor de Checklist</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
        
        <Button variant="outline" size="sm" onClick={onStartInspection}>
          <Play className="h-4 w-4 mr-2" />
          Iniciar Inspeção
        </Button>
        
        <Button size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
}
