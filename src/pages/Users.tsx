
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
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Carregar usuários com suas empresas e checklists
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });

      if (usersError) throw usersError;

      const usersWithDetails = await Promise.all(
        (usersData || []).map(async (user) => {
          // Buscar empresas do usuário
          const { data: companiesData } = await supabase
            .from("user_companies")
            .select("companies(id, fantasy_name)")
            .eq("user_id", user.id);

          // Buscar checklists do usuário
          const { data: checklistsData } = await supabase
            .from("user_checklists")
            .select("checklist_id")
            .eq("user_id", user.id);

          return {
            ...user,
            role: user.role as UserRole,
            companies: companiesData?.map(c => c.companies?.fantasy_name).filter(Boolean) || [],
            checklists: checklistsData?.length || 0
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

  const handleAddUser = async () => {
    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        email_confirm: true,
        user_metadata: { name: newUser.name }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Atualizar informações do usuário
        const { error: updateError } = await supabase
          .from("users")
          .update({ 
            role: newUser.role,
            status: newUser.status,
            name: newUser.name
          })
          .eq("id", authData.user.id);

        if (updateError) throw updateError;

        // 3. Adicionar associações de empresas
        if (selectedCompanies.length > 0) {
          const companyAssignments = selectedCompanies.map(companyId => ({
            user_id: authData.user.id,
            company_id: companyId
          }));

          const { error: companiesError } = await supabase
            .from("user_companies")
            .insert(companyAssignments);

          if (companiesError) throw companiesError;
        }

        // 4. Adicionar associações de checklists
        if (selectedChecklists.length > 0) {
          const checklistAssignments = selectedChecklists.map(checklistId => ({
            user_id: authData.user.id,
            checklist_id: checklistId
          }));

          const { error: checklistsError } = await supabase
            .from("user_checklists")
            .insert(checklistAssignments);

          if (checklistsError) throw checklistsError;
        }

        toast({ 
          title: "Usuário adicionado", 
          description: "O usuário foi cadastrado com sucesso." 
        });
        
        setIsAddingUser(false);
        setNewUser({ name: "", email: "", role: "Técnico", status: "active" });
        setSelectedCompanies([]);
        setSelectedChecklists([]);
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
      // Deletar o usuário (as tabelas relacionadas serão limpas automaticamente devido ao ON DELETE CASCADE)
      const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id);
      if (authError) throw authError;

      toast({ 
        title: "Usuário excluído", 
        description: "O usuário foi removido com sucesso." 
      });
      
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
