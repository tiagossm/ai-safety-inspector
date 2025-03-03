
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Checklist } from "@/types/checklist";

interface ChecklistHeaderProps {
  checklist: Checklist | null;
  saving: boolean;
  onSave: () => void;
}

export default function ChecklistHeader({ checklist, saving, onSave }: ChecklistHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/checklists")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">{checklist?.title}</h1>
      </div>
      <Button 
        onClick={onSave} 
        disabled={saving || !checklist}
      >
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </div>
  );
}
