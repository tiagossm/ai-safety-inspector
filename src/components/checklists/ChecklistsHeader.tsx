
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function ChecklistsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checklists</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas listas de verificação e acompanhe seu progresso
        </p>
      </div>
      
      <div className="flex gap-2 self-end sm:self-auto">
        <Button asChild>
          <Link to="/new-checklists/create">
            <Plus className="mr-2 h-4 w-4" />
            Criar Checklist
          </Link>
        </Button>
      </div>
    </div>
  );
}
