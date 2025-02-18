
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { UserHeader } from "@/components/users/UserHeader";
import { UserRow } from "@/components/users/UserRow";
import { AddUserSheet } from "@/components/users/AddUserSheet";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/user";

export function UserList() {
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);

  const { users, saveUser, deleteUser } = useUsers();

  const handleSaveUser = async (user: Omit<User, "id">, selectedCompanies: string[], selectedChecklists: string[]) => {
    const success = await saveUser(user, selectedUser, selectedCompanies, selectedChecklists);
    if (success) {
      setIsEditingUser(false);
      setSelectedUser(null);
      setSelectedCompanies([]);
      setSelectedChecklists([]);
    }
    return success;
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
    <Card>
      <CardHeader>
        <UserHeader
          showInactive={showInactive}
          setShowInactive={setShowInactive}
          search={search}
          setSearch={setSearch}
          onAddUser={() => setIsEditingUser(true)}
        />
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo de Perfil</TableHead>
              <TableHead>Empresas</TableHead>
              <TableHead>Checklists</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
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
                  setSelectedCompanies(user.companies || []);
                  setSelectedChecklists(user.checklists || []);
                }}
                onDelete={() => setUserToDelete(user)}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AddUserSheet
        open={isEditingUser}
        onOpenChange={setIsEditingUser}
        user={selectedUser}
        onSave={handleSaveUser}
        selectedCompanies={selectedCompanies}
        setSelectedCompanies={setSelectedCompanies}
        selectedChecklists={selectedChecklists}
        setSelectedChecklists={setSelectedChecklists}
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
