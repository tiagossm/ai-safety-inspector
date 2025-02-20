
import { Button } from "@/components/ui/button";
import { Brain, ClipboardCheck, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CompanyActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onStartInspection: () => void;
  onAnalyze: () => void;
  analyzing: boolean;
}

export const CompanyActions = ({
  onEdit,
  onDelete,
  onStartInspection,
  onAnalyze,
  analyzing
}: CompanyActionsProps) => {
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Pencil className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar Empresa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Empresa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onStartInspection}
        title="Iniciar Nova Inspeção"
      >
        <ClipboardCheck className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onAnalyze}
        disabled={analyzing}
        title="Analisar NRs Aplicáveis"
      >
        <Brain className="h-4 w-4" />
      </Button>
    </div>
  );
};
