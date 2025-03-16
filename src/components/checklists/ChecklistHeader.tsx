
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checklist } from "@/types/checklist";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChecklistHeaderProps {
  checklist: Checklist | null;
  saving: boolean;
  onSave: () => void;
}

export default function ChecklistHeader({ checklist, saving, onSave }: ChecklistHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/checklists")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {checklist ? checklist.title : "Carregando..."}
          </h2>
          <p className="text-muted-foreground">
            {checklist && checklist.is_template ? "Template de Checklist" : "Checklist personalizado"}
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onSave} 
        disabled={saving || !checklist}
      >
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
