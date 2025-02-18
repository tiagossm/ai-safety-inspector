
import { User } from "@/types/user";
import { UserRow } from "./UserRow";
import { Skeleton } from "@/components/ui/skeleton";

interface UserListProps {
  users?: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export function UserList({ 
  users = [], // Provide default empty array
  loading = false,
  onEdit = () => {}, // Provide default noop function
  onDelete = () => {} // Provide default noop function
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

  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="space-y-4">
      {safeUsers.map((user) => (
        <UserRow
          key={user.id}
          user={user}
          onEdit={() => onEdit(user)}
          onDelete={() => onDelete(user.id)}
        />
      ))}
      {safeUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      )}
    </div>
  );
}
