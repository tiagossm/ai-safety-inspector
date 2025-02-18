
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
      email_secondary: user.email_secondary,
      phone: user.phone,
      phone_secondary: user.phone_secondary,
      cpf: user.cpf,
      role: user.role as UserRole || UserRole.USER,
      status: user.status as UserStatus || UserStatus.ACTIVE,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
  },

  async checkEmailUnique(email: string, excludeId?: string): Promise<boolean> {
    const query = supabase
      .from('users')
      .select('id')
      .eq('email', email);
      
    if (excludeId) {
      query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.length === 0;
  },

  async create(userData: Omit<User, "id" | "created_at">): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        email_secondary: userData.email_secondary,
        phone: userData.phone,
        phone_secondary: userData.phone_secondary,
        cpf: userData.cpf,
        role: userData.role,
        status: userData.status
      }])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No data returned from insert');
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      email_secondary: data.email_secondary,
      phone: data.phone,
      phone_secondary: data.phone_secondary,
      cpf: data.cpf,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async update(id: string, updates: Partial<Omit<User, "id" | "created_at">>): Promise<User> {
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
      email_secondary: data.email_secondary,
      phone: data.phone,
      phone_secondary: data.phone_secondary,
      cpf: data.cpf,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      created_at: data.created_at,
      updated_at: data.updated_at
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
