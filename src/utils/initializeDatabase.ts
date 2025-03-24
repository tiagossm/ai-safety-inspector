
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function initializeInspectionsSchema() {
  try {
    console.log("Initializing inspections database schema...");
    
    const { data, error } = await supabase.functions.invoke('initialize-inspections-schema');
    
    if (error) {
      console.error("Error initializing database schema:", error);
      toast.error("Failed to initialize database schema");
      return false;
    }
    
    console.log("Database schema initialized successfully:", data);
    return true;
  } catch (err) {
    console.error("Exception initializing database schema:", err);
    toast.error("An error occurred while initializing the database");
    return false;
  }
}
