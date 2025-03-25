
import { supabase } from "@/integrations/supabase/client";

export const initializeInspectionsSchema = async () => {
  try {
    console.log("Initializing inspections database schema...");
    
    // First check if the database schema already exists by querying the inspections table
    const { data: tableCheck, error: tableError } = await supabase
      .from('inspections')
      .select('id')
      .limit(1);
    
    // If we can query the table successfully, we don't need to initialize
    if (!tableError) {
      console.log("Database schema appears to be initialized already.");
      return { success: true };
    }
    
    // Only call the Edge Function if the table check fails
    const { data, error } = await supabase.functions.invoke('initialize-inspections-schema', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (error) {
      console.error("Error initializing database schema:", error);
      // Even if initialization fails, allow the app to continue
      // This helps when the edge function hasn't been deployed yet
      return { success: false, error };
    }
    
    console.log("Database schema initialized successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error initializing database schema:", error);
    // Even if initialization fails, allow the app to continue
    return { success: false, error };
  }
};
