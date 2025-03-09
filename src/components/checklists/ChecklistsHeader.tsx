
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function ChecklistsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Listas de Verificação</h1>
        <p className="text-muted-foreground">
          Crie e gerencie suas listas de verificação
        </p>
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Todos os checklists</DropdownMenuItem>
            <DropdownMenuItem>Meus checklists</DropdownMenuItem>
            <DropdownMenuItem>Checklists ativos</DropdownMenuItem>
            <DropdownMenuItem>Templates</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button asChild>
          <Link to="/checklists/create" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Criar Nova Lista
          </Link>
        </Button>
      </div>
    </div>
  );
}
