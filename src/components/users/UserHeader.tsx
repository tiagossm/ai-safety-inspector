
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

interface UserHeaderProps {
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
  onAddUser: () => void;
  onRefresh: () => Promise<void>;
}

export function UserHeader({
  showInactive,
  setShowInactive,
  search,
  setSearch,
  onAddUser,
  onRefresh
}: UserHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <Input
          placeholder="Buscar usuários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
      <Button variant="outline" onClick={onRefresh}>
        Atualizar
      </Button>
      <Button onClick={onAddUser}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Novo Usuário
      </Button>
    </div>
  );
}
