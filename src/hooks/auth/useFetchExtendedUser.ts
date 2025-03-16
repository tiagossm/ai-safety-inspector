
import { supabase } from "@/integrations/supabase/client";

export async function fetchExtendedUser(userId: string): Promise<any | null> {
  try {
    console.log("Fetching extended user data for:", userId);
    const { data, error } = await supabase
      .from("users")
      .select("id, company_id, name, role, tier")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
    
    console.log("Extended user data:", data);
    return data;
  } catch (err) {
    console.error("Error fetching user data:", err);
    return null;
  }
}
