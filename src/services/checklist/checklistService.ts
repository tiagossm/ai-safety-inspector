
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches all checklists from the database
 */
export const fetchChecklists = async () => {
  try {
    const { data, error } = await supabase
      .from("checklists")
      .select(`
        *,
        companies(*),
        users:responsible_id(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching checklists:", error);
    throw error;
  }
};

/**
 * Fetches a checklist by ID
 */
export const fetchChecklistById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("checklists")
      .select(`
        *,
        companies(*),
        users:responsible_id(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching checklist by ID:", error);
    throw error;
  }
};
