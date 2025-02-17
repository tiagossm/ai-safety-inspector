
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, UserPlus } from "lucide-react";

interface UserHeaderProps {
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
  onAddUser: () => void;
}

export function UserHeader({ 
  showInactive, 
  setShowInactive, 
  search, 
  setSearch,
  onAddUser 
}: UserHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Usuários</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários da plataforma, atribua empresas e checklists
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={showInactive} 
              onCheckedChange={setShowInactive}
            />
            <span className="text-sm">Mostrar Inativos</span>
          </div>
          <Button className="bg-green-500 hover:bg-green-600" onClick={onAddUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 w-full md:w-96"
        />
      </div>
    </div>
  );
}
