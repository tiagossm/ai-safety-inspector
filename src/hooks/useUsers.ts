
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/user";
import { fetchUsers, createOrUpdateUser, deleteUserById } from "@/services/userService";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      console.log("Loading users...");
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveUser = async (
    user: Omit<User, "id">,
    selectedUser: User | null,
    selectedCompanies: string[],
    selectedChecklists: string[]
  ) => {
    try {
      await createOrUpdateUser(user, selectedUser, selectedCompanies, selectedChecklists);
      
      toast({
        title: selectedUser ? "Usuário atualizado" : "Usuário adicionado",
        description: selectedUser ? "Dados do usuário foram atualizados." : "Novo usuário cadastrado."
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
      await deleteUserById(userId);
      
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
