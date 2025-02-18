
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { User, UserRole } from "@/types/user";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      console.log("Loading users with admin client...");
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, name, email, role, status")
        .order("name", { ascending: true });

      console.log("Users data:", usersData);
      console.log("Users error:", usersError);

      if (usersError) throw usersError;

      const usersWithDetails = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: companiesData } = await supabaseAdmin
            .from("user_companies")
            .select("companies(id, fantasy_name)")
            .eq("user_id", user.id);

          const { data: checklistsData } = await supabaseAdmin
            .from("user_checklists")
            .select("checklist_id")
            .eq("user_id", user.id);

          return {
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            role: user.role as UserRole,
            status: user.status || "active",
            companies: companiesData?.map(c => c.companies?.fantasy_name).filter(Boolean) || [],
            checklists: checklistsData?.map(c => c.checklist_id) || []
          } as User;
        })
      );

      setUsers(usersWithDetails);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveUser = async (user: Omit<User, "id">, selectedUser: User | null, selectedCompanies: string[], selectedChecklists: string[]) => {
    try {
      let userId = selectedUser?.id;

      if (!userId) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          password: "temporary123",
          user_metadata: { name: user.name }
        });

        if (authError) throw authError;
        userId = authData.user?.id;

        if (!userId) throw new Error("Failed to create user");

        await supabaseAdmin
          .from("users")
          .insert({
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          });
      } else {
        await supabaseAdmin
          .from("users")
          .update({
            name: user.name,
            role: user.role,
            status: user.status
          })
          .eq("id", userId);
      }

      if (selectedCompanies.length > 0) {
        await supabaseAdmin
          .from("user_companies")
          .delete()
          .eq("user_id", userId);

        const companyAssignments = selectedCompanies.map(companyId => ({
          user_id: userId,
          company_id: companyId
        }));

        await supabaseAdmin
          .from("user_companies")
          .insert(companyAssignments);
      }

      if (selectedChecklists.length > 0) {
        await supabaseAdmin
          .from("user_checklists")
          .delete()
          .eq("user_id", userId);

        const checklistAssignments = selectedChecklists.map(checklistId => ({
          user_id: userId,
          checklist_id: checklistId
        }));

        await supabaseAdmin
          .from("user_checklists")
          .insert(checklistAssignments);
      }

      toast({
        title: userId === selectedUser?.id ? "Usuário atualizado" : "Usuário adicionado",
        description: userId === selectedUser?.id ? "Dados do usuário foram atualizados." : "Novo usuário cadastrado."
      });

      await loadUsers();
      return true;
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "Erro ao salvar usuário",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteUser = async (userId: string, confirmText: string) => {
    if (confirmText !== "CONFIRMAR") {
      toast({
        title: "Confirmação necessária",
        description: "Digite 'CONFIRMAR' para excluir o usuário",
        variant: "destructive"
      });
      return false;
    }

    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", userId);

      toast({ 
        title: "Usuário excluído", 
        description: "O usuário foi removido." 
      });

      await loadUsers();
      return true;
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({ 
        title: "Erro ao excluir", 
        description: error.message, 
        variant: "destructive" 
      });
      return false;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    saveUser,
    deleteUser,
    loadUsers
  };
}
