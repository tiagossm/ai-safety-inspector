
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, UserStatus } from "@/types/user";

export const UsersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
      
    if (error) throw new Error(error.message);
    
    return (data || []).map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role as UserRole || UserRole.USER,
      status: user.status as UserStatus || UserStatus.ACTIVE,
      createdAt: user.created_at || new Date().toISOString(),
      lastActivity: user.updated_at,
      company: user.company
    }));
  },

  async create(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: userData.status,
        company: userData.company
      }])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No data returned from insert');
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      createdAt: data.created_at,
      lastActivity: data.updated_at,
      company: data.company
    };
  },

  async update(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No data returned from update');
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      createdAt: data.created_at,
      lastActivity: data.updated_at,
      company: data.company
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
};
