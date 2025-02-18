import { supabase } from "@/lib/supabase";
import { User, UserRole, UserStatus } from "@/types/user";

export const UsersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(error.message);
    return data as User[];
  },

  async create(user: Omit<User, 'id'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select();
      
    if (error) throw new Error(error.message);
    return data[0] as User;
  },

  async update(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) throw new Error(error.message);
    return data[0] as User;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
};