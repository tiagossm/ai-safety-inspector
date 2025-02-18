
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { UserHeader } from "@/components/users/UserHeader";
import { UserRow } from "@/components/users/UserRow";
import { AddUserSheet } from "@/components/users/AddUserSheet";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { User, UserRole } from "@/types/user";

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });

      if (usersError) throw usersError;

      const usersWithDetails = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: companiesData } = await supabase
            .from("user_companies")
            .select("companies(id, fantasy_name)")
            .eq("user_id", user.id);

          const { data: checklistsData } = await supabase
            .from("user_checklists")
            .select("checklist_id")
            .eq("user_id", user.id);

          return {
            ...user,
            role: user.role as UserRole,
            companies: companiesData?.map(c => c.companies?.fantasy_name).filter(Boolean) || [],
            checklists: checklistsData?.map(c => c.checklist_id) || []
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveUser = async (user: Omit<User, 'id'>) => {
    try {
      let userId = selectedUser?.id;

      if (!userId) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: { name: user.name }
        });

        if (authError) throw authError;
        userId = authData.user?.id;

        await supabase.from("users").insert({
          id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        });
      } else {
        await supabase.from("users").update({
          name: user.name,
          role: user.role,
          status: user.status
        }).eq("id", userId);
      }

      if (selectedCompanies.length > 0) {
        await supabase.from("user_companies").delete().eq("user_id", userId);
        const companyAssignments = selectedCompanies.map(companyId => ({
          user_id: userId,
          company_id: companyId
        }));
        await supabase.from("user_companies").insert(companyAssignments);
      }

      if (selectedChecklists.length > 0) {
        await supabase.from("user_checklists").delete().eq("user_id", userId);
        const checklistAssignments = selectedChecklists.map(checklistId => ({
          user_id: userId,
          checklist_id: checklistId
        }));
        await supabase.from("user_checklists").insert(checklistAssignments);
      }

      toast({
        title: userId === selectedUser?.id ? "Usuário atualizado" : "Usuário adicionado",
        description: userId === selectedUser?.id ? "Dados do usuário foram atualizados." : "Novo usuário cadastrado."
      });

      setIsEditingUser(false);
      setSelectedUser(null);
      setSelectedCompanies([]);
      setSelectedChecklists([]);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar usuário",
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
      await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
      toast({ title: "Usuário excluído", description: "O usuário foi removido." });

      loadUsers();
      setDeleteConfirmText("");
      setUserToDelete(null);
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

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
            {users.map((user) => (
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
