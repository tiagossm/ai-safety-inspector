import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserHeader } from "@/components/users/UserHeader";
import { UserRow } from "@/components/users/UserRow";
import { AddUserSheet } from "@/components/users/AddUserSheet";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { User, UserRole } from "@/types/user";

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ 
    name: "", 
    email: "", 
    role: "Técnico", 
    status: "active" 
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setUsers(data.map(user => ({
        ...user,
        role: user.role as UserRole,
        companies: ["Empresa A", "Empresa B"],
        checklists: Math.floor(Math.random() * 10)
      })));
    }
  };

  const handleAddUser = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        email_confirm: true,
        user_metadata: { name: newUser.name }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ 
            role: newUser.role,
            status: newUser.status 
          })
          .eq("id", authData.user.id);

        if (updateError) throw updateError;

        toast({ title: "Usuário adicionado", description: "O usuário foi cadastrado com sucesso." });
        setIsAddingUser(false);
        setNewUser({ name: "", email: "", role: "Técnico", status: "active" });
        loadUsers();
      }
    } catch (error: any) {
      toast({ 
        title: "Erro ao adicionar usuário", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (deleteConfirmText !== "CONFIRMAR") {
      toast({
        title: "Confirmação necessária",
        description: "Digite 'CONFIRMAR' para excluir o usuário",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id);
      if (authError) throw authError;

      toast({ title: "Usuário excluído", description: "O usuário foi removido com sucesso." });
      loadUsers();
      setDeleteConfirmText("");
      setUserToDelete(null);
    } catch (error: any) {
      toast({ 
        title: "Erro ao excluir", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const filteredUsers = users
    .filter(user => (showInactive ? user.status === "inactive" : user.status === "active"))
    .filter(user => 
      user.name?.toLowerCase().includes(search.toLowerCase()) || 
      user.email?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Card>
      <CardHeader>
        <UserHeader 
          showInactive={showInactive}
          setShowInactive={setShowInactive}
          search={search}
          setSearch={setSearch}
          onAddUser={() => setIsAddingUser(true)}
        />
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Usuário</TableHead>
              <TableHead>Tipo de Perfil</TableHead>
              <TableHead>Empresas</TableHead>
              <TableHead>Checklists</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <UserRow 
                key={user.id}
                user={user}
                onEdit={() => {}} // Implementar edição
                onDelete={() => setUserToDelete(user)}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AddUserSheet
        open={isAddingUser}
        onOpenChange={setIsAddingUser}
        newUser={newUser}
        onNewUserChange={setNewUser}
        onSave={handleAddUser}
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
