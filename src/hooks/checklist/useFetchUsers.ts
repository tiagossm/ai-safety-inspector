
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
}

export function useFetchUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        // Don't refetch if we already have users
        if (users.length > 0) return;
        
        console.log("Fetching users for responsible selection");
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        if (isMounted && data) {
          setUsers(data as User[]);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };
    
    fetchUsers();
    
    return () => {
      isMounted = false;
    };
  }, [users.length]);

  return users;
}
