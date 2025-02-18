
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserList } from "@/components/users/UserList";
import { AddUserSheet } from "./AddUserSheet";
import { UserHeader } from "@/components/users/UserHeader";
import { DeleteUserDialog } from "@/components/shared/DeleteUserDialog";
import { User } from "@/types/user";

export default function UsersPage() {
  const { users, loading, refresh, createUser, updateUser, deleteUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const handleDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      refresh();
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <UserHeader
        search={search}
        setSearch={setSearch}
        showInactive={showInactive}
        setShowInactive={setShowInactive} 
        onRefresh={refresh}
        onAddUser={() => setEditOpen(true)}
      />
      
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
        onSave={refresh}
      />

      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={selectedUser}
        onConfirm={handleDelete}
      />
    </div>
  );
}
