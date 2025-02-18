
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { UserHeader } from "@/components/users/UserHeader";
import { UserRow } from "@/components/users/UserRow";
import { AddUserSheet } from "@/components/users/AddUserSheet";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/user";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UserList() {
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { users, saveUser, deleteUser } = useUsers();

  const handleSaveUser = async (user: Omit<User, "id">) => {
    const success = await saveUser(user, selectedUser);
    if (success) {
      setIsEditingUser(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const success = await deleteUser(userToDelete.id, deleteConfirmText);
    if (success) {
      setDeleteConfirmText("");
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = search.length === 0 || 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = showInactive || user.status === "active";
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-border/50">
        <UserHeader
          showInactive={showInactive}
          setShowInactive={setShowInactive}
          search={search}
          setSearch={setSearch}
          onAddUser={() => setIsEditingUser(true)}
        />
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Usuário</TableHead>
                <TableHead className="font-semibold">Tipo de Perfil</TableHead>
                <TableHead className="font-semibold">Empresas</TableHead>
                <TableHead className="font-semibold">Checklists</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={() => {
                    setSelectedUser(user);
                    setIsEditingUser(true);
                  }}
                  onDelete={() => setUserToDelete(user)}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      <AddUserSheet
        open={isEditingUser}
        onOpenChange={setIsEditingUser}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      <DeleteUserDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        onConfirm={handleDeleteUser}
      />
    </Card>
  );
}
