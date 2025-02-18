import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserList } from "@/components/users/UserList";
import { AddUserSheet } from "@/components/users/AddUserSheet";
import { UserHeader } from "@/components/users/UserHeader";
import { DeleteUserDialog } from "@/components/shared/DeleteUserDialog";

export default function UsersPage() {
  const { users, loading, refresh, createUser, updateUser, deleteUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async (userId: string) => {
    await deleteUser(userId);
    refresh();
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-8">
      <UserHeader onRefresh={refresh} onAddUser={() => setEditOpen(true)} />
      
      <UserList
        users={users}
        loading={loading}
        onEdit={(user) => {
          setSelectedUser(user);
          setEditOpen(true);
        }}
        onDelete={(userId) => {
          setSelectedUser(users.find(u => u.id === userId) || null);
          setDeleteOpen(true);
        }}
      />

      <AddUserSheet
        open={editOpen}
        user={selectedUser}
        onClose={() => {
          setEditOpen(false);
          setSelectedUser(null);
        }}
        onSave={async (userData) => {
          if (selectedUser) {
            await updateUser(selectedUser.id, userData);
          } else {
            await createUser(userData);
          }
          refresh();
        }}
      />

      <DeleteUserDialog
        open={deleteOpen}
        user={selectedUser}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => selectedUser && handleDelete(selectedUser.id)}
      />
    </div>
  );
}