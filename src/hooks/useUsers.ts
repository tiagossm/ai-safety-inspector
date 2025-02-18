
import { useEffect, useState } from "react";
import { UsersService } from "@/lib/services/users";
import { User } from "@/types/user";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await UsersService.getAll();
      setUsers(data || []); // Ensure we set an empty array if data is undefined
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    users,
    loading,
    error,
    refresh,
    createUser: UsersService.create,
    updateUser: UsersService.update,
    deleteUser: UsersService.delete
  };
};
