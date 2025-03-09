
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useChecklistUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .order('name');
        
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);

  return {
    users,
    loadingUsers
  };
}
