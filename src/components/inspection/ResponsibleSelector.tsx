
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ResponsibleSelectorProps {
  value: string;
  onSelect: (userId: string, userData?: any) => void;
}

export function ResponsibleSelector({ value, onSelect }: ResponsibleSelectorProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, phone')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Handler para passar os dados do usuário junto com o ID
  const handleUserSelection = (userId: string) => {
    if (userId === "none") {
      onSelect(userId);
      return;
    }
    
    // Encontrar os dados do usuário selecionado
    const selectedUser = users.find(user => user.id === userId);
    
    // Passa o ID e os dados completos do usuário
    onSelect(userId, selectedUser);
  };

  // Garantir que value seja sempre uma string válida
  const safeValue = value || "none";

  return (
    <Select value={safeValue} onValueChange={handleUserSelection}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione um responsável" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhum</SelectItem>
        {loading ? (
          <SelectItem value="loading" disabled>Carregando...</SelectItem>
        ) : (
          users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name || user.email || 'Usuário sem nome'}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
