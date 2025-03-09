
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useChecklists } from "@/hooks/useChecklists";
import { toast } from "sonner";

export function ChecklistsHeader() {
  const { refetch, setFilterType } = useChecklists();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Lista de checklists atualizada");
    } catch (error) {
      console.error("Erro ao atualizar checklists:", error);
      toast.error("Erro ao atualizar lista de checklists");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Listas de Verificação</h1>
        <p className="text-muted-foreground">
          Crie e gerencie suas listas de verificação
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterType("all")}>
              Todos os checklists
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("my")}>
              Meus checklists
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("active")}>
              Checklists ativos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("templates")}>
              Templates
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button asChild>
          <Link to="/checklists/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Criar Nova Lista
          </Link>
        </Button>
      </div>
    </div>
  );
}
