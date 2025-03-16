
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checklist } from "@/types/checklist";
import { ArrowLeft, Save, Play, FileEdit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChecklistHeaderProps {
  checklist: Checklist;
  saving?: boolean;
  onSave?: () => void;
  isNewChecklist?: boolean;
}

export default function ChecklistHeader({ 
  checklist, 
  saving, 
  onSave,
  isNewChecklist = false 
}: ChecklistHeaderProps) {
  const navigate = useNavigate();
  const createdAt = checklist.created_at ? new Date(checklist.created_at) : null;
  const timeAgo = createdAt 
    ? formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR }) 
    : "";
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/checklists")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <h1 className="text-xl font-bold truncate">
            {isNewChecklist ? "Criar Novo Checklist" : checklist.title}
          </h1>
        </div>
        {!isNewChecklist && createdAt && (
          <p className="text-sm text-muted-foreground">
            Criado {timeAgo} • {checklist.status_checklist === "ativo" ? "Ativo" : "Inativo"}
          </p>
        )}
      </div>
      
      <div className="flex gap-2">
        {onSave && (
          <Button 
            variant="outline" 
            onClick={onSave} 
            disabled={saving}
            className="h-9"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        )}
        
        {!isNewChecklist && (
          <Button 
            variant="default" 
            className="h-9"
            onClick={() => {
              // Navigate to execute checklist page
              navigate(`/checklists/${checklist.id}/execute`);
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            Executar
          </Button>
        )}
      </div>
    </div>
  );
}
