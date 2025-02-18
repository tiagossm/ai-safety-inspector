import { User } from "@/types/user";
import { UserRow } from "./UserRow";
import { Skeleton } from "@/components/ui/skeleton";

export const UserList = ({ 
  users,
  loading,
  onEdit,
  onDelete
}: {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}) => {
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
    <div className="space-y-4">
      {users.map((user) => (
        <UserRow
          key={user.id}
          user={user}
          onEdit={() => onEdit(user)}
          onDelete={() => onDelete(user.id)}
        />
      ))}
    </div>
  );
};