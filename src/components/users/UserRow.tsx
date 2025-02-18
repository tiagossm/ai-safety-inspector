import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

export const UserRow = ({ 
  user,
  onEdit,
  onDelete
}: {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex-1">
        <h3 className="font-medium">{user.name}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Editar usuário">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} aria-label="Excluir usuário">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};