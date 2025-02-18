
import { User, UserStatus } from "@/types/user";
import { UserRow } from "./UserRow";
import { Skeleton } from "@/components/ui/skeleton";

interface UserListProps {
  users?: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => Promise<void>;
  onStatusToggle?: (id: string, status: UserStatus) => Promise<void>;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function UserList({
  users = [],
  loading = false,
  onEdit = () => {},
  onDelete = async () => {},
  onStatusToggle = async () => {},
  isDeleting = false,
  isUpdating = false
}: UserListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[62px] w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-muted/50">
          <tr>
            <th className="p-4">Nome</th>
            <th className="p-4">Email</th>
            <th className="p-4">Função</th>
            <th className="p-4">Status</th>
            <th className="p-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusToggle={onStatusToggle}
              isDeleting={isDeleting}
              isUpdating={isUpdating}
            />
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      )}
    </div>
  );
}
