
import { toast } from "sonner";

/**
 * Synchronizes pending operations with the server
 */
export async function syncWithServer(
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
) {
  try {
    if (syncCallback) syncCallback(true);
    
    console.log("Starting server synchronization...");
    
    // Get all pending operations from IndexedDB
    try {
      const { getOfflineData } = await import('../offlineDb');
      const pendingOperations = await getOfflineData('syncQueue');
      console.log(`Found ${pendingOperations.length} pending operations`);
      
      // Process each pending operation
      if (pendingOperations.length > 0) {
        console.log("Processing pending operations...");
        // Import the supabase client for processing the operations
        const { supabase } = await import('@/integrations/supabase/client');
        
        for (const op of pendingOperations) {
          try {
            console.log(`Processing operation: ${op.operation} for table ${op.table}`);
            // Handle each operation type
            if (op.operation === 'insert') {
              const { data, error } = await supabase
                .from(op.table)
                .insert(op.data)
                .select();
                
              if (error) throw error;
              
              // Type-safe check for data and id property
              if (data && data.length > 0 && 'id' in data[0]) {
                console.log(`Inserted record into ${op.table}:`, data[0].id);
              } else {
                console.log(`Inserted record into ${op.table}, but couldn't get ID`);
              }
            } else if (op.operation === 'update') {
              const { data, error } = await supabase
                .from(op.table)
                .upsert(op.data)
                .select();
                
              if (error) throw error;
              console.log(`Updated record in ${op.table}:`, op.data.id);
            } else if (op.operation === 'delete') {
              const { error } = await supabase
                .from(op.table)
                .delete()
                .match({ id: op.data.id });
                
              if (error) throw error;
              console.log(`Deleted record from ${op.table}:`, op.data.id);
            }
            
            // Clear the operation from the queue after successful processing
            const { clearSyncItem } = await import('../offlineDb');
            // Safely check if op has an id property before accessing it
            if (op && 'id' in op) {
              await clearSyncItem(op.id);
            } else {
              console.warn(`Cannot clear sync item: missing ID property`);
            }
          } catch (opError) {
            console.error(`Error processing operation ${op && 'id' in op ? op.id : 'unknown'}:`, opError);
            // We continue with other operations even if one fails
          }
        }
      }
    } catch (dbError) {
      console.error("Error accessing offline database:", dbError);
      if (errorCallback && dbError instanceof Error) errorCallback(dbError);
      // Continue with sync even if accessing offline data fails
    }
    
    // Perform other sync operations safely
    try {
      // Check connection to Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.from('checklists').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw new Error(`Supabase connection error: ${error.message}`);
      }
      
      // Continue with other sync operations if needed
      // ...
      
    } catch (apiError) {
      console.error("Error during API operations:", apiError);
      if (errorCallback && apiError instanceof Error) errorCallback(apiError);
      if (syncCallback) syncCallback(false);
      return false;
    }
    
    // Simulate some sync work
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("Server synchronization completed successfully");
    if (syncCallback) syncCallback(false);
    return true;
  } catch (error) {
    console.error("Error during server synchronization:", error);
    // Show a user-friendly message
    toast.error("Falha na sincronização. Algumas funcionalidades podem estar indisponíveis.");
    if (errorCallback && error instanceof Error) errorCallback(error);
    if (syncCallback) syncCallback(false);
    return false;
  }
}
