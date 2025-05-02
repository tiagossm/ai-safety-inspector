
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ResponsibleSearchResult = {
  id: string;
  name: string;
  email: string;
  position: string | null;
};

/**
 * Fetches all users (responsibles) with optional search term
 */
export async function fetchResponsibles(searchTerm?: string): Promise<ResponsibleSearchResult[]> {
  try {
    const query = supabase
      .from("users")
      .select("id, name, email, position");
      
    // Apply search filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order("name", { ascending: true });

    if (error) throw error;

    return (data || []).map(user => ({
      id: user.id,
      name: user.name || user.email || 'Usuário sem nome',
      email: user.email || '',
      position: user.position || null
    }));
  } catch (error) {
    console.error("Error fetching responsibles:", error);
    return [];
  }
}

/**
 * Fetches multiple responsibles by IDs
 */
export async function fetchResponsiblesByIds(ids: string[]): Promise<ResponsibleSearchResult[]> {
  if (!ids || ids.length === 0) return [];
  
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, position")
      .in("id", ids);

    if (error) throw error;
    
    return (data || []).map(user => ({
      id: user.id,
      name: user.name || user.email || 'Usuário sem nome',
      email: user.email || '',
      position: user.position || null
    }));
  } catch (error) {
    console.error("Error fetching responsibles by IDs:", error);
    return [];
  }
}

/**
 * Fetches a single responsible by ID
 */
export async function fetchResponsibleById(id: string): Promise<ResponsibleSearchResult | null> {
  if (!id) return null;
  
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, position")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;

    return {
      id: data.id,
      name: data.name || data.email || 'Usuário sem nome',
      email: data.email || '',
      position: data.position || null
    };
  } catch (error) {
    console.error("Error fetching responsible by ID:", error);
    return null;
  }
}

/**
 * Create a new responsible (user) with quick form
 */
export async function createResponsible(userData: {
  name: string;
  email: string;
  position?: string;
}): Promise<ResponsibleSearchResult | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: userData.name,
          email: userData.email,
          position: userData.position || null
        }
      ])
      .select("id, name, email, position")
      .single();

    if (error) throw error;
    
    toast.success("Responsável criado com sucesso");
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      position: data.position
    };
  } catch (error) {
    console.error("Error creating responsible:", error);
    toast.error("Erro ao criar responsável");
    return null;
  }
}
