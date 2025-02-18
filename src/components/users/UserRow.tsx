
import { User, UserRole, UserStatus } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusToggle: (id: string, status: UserStatus) => Promise<void>;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function UserRow({
  user,
  onEdit,
  onDelete,
  onStatusToggle,
  isDeleting,
  isUpdating
}: UserRowProps) {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4">{user.name}</td>
      <td className="p-4">{user.email}</td>
      <td className="p-4">{user.role}</td>
      <td className="p-4">
        <Switch
          checked={user.status === UserStatus.ACTIVE}
          onCheckedChange={() => 
            onStatusToggle(
              user.id, 
              user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE
            )
          }
          disabled={isUpdating}
          aria-label="Toggle user status"
        />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
            disabled={isUpdating}
            aria-label="Edit user"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                disabled={isDeleting}
                aria-label="Delete user"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(user.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
}
