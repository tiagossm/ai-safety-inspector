
import { supabase } from "@/integrations/supabase/client";

export const initializeInspectionsSchema = async () => {
  try {
    console.log("Initializing inspections database schema...");
    
    const { data, error } = await supabase.functions.invoke('initialize-inspections-schema', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (error) {
      console.error("Error initializing database schema:", error);
      return { success: false, error };
    }
    
    console.log("Database schema initialized successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error initializing database schema:", error);
    // Even if initialization fails, allow the app to continue
    // This helps when the edge function hasn't been deployed yet
    return { success: false, error };
  }
};
