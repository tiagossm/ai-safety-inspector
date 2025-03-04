
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function ChecklistsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Listas de Verificação</h1>
        <p className="text-muted-foreground">
          Gerencie todas as suas listas de verificação e inspeções.
        </p>
      </div>
      
      <Link to="/checklists/new">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Checklist
        </Button>
      </Link>
    </div>
  );
}
