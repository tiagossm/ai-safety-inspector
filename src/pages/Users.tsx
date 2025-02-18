
import { useState } from "react";
import { UserList } from "@/components/users/UserList";
import { UserHeader } from "@/components/users/UserHeader";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/user";
import { AddUserSheet } from "@/components/users/AddUserSheet";

export function Users() {
  const {
    users,
    isLoading,
    search,
    setSearch,
    showInactive,
    setShowInactive,
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
    isDeleting,
    refetch
  } = useUsers();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddUserOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsAddUserOpen(true);
  };

  const handleSubmitUser = async (data: Omit<User, "id" | "created_at">) => {
    try {
      if (selectedUser) {
        await updateUser({ id: selectedUser.id, data });
      } else {
        await createUser(data);
      }
      setIsAddUserOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error submitting user:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <UserHeader
        search={search}
        setSearch={setSearch}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
        onAddUser={handleAddUser}
        onRefresh={refetch}
      />
      
      <UserList
        users={users}
        loading={isLoading}
        onEdit={handleEditUser}
        onDelete={deleteUser}
        onStatusToggle={async (id, status) => {
          await updateUser({ id, data: { status } });
        }}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
      />

      <AddUserSheet
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSubmit={handleSubmitUser}
        initialData={selectedUser || undefined}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
