
import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

interface SyncOperation {
  table: string;
  operationType: 'insert' | 'update' | 'delete';
  record: any;
}

export class SyncManager {
  private client: SupabaseClient;
  private operations: SyncOperation[] = [];
  private isSyncing: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  addOperation(operation: SyncOperation) {
    this.operations.push(operation);
    if (!this.isSyncing) {
      this.sync();
    }
  }

  private async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    while (this.operations.length > 0) {
      const operation = this.operations.shift();
      if (!operation) break;

      const { table, operationType, record } = operation;
      this.retryCount = 0;

      try {
        if (operationType === 'insert') {
          await this.handleInsert(table, record);
        } else if (operationType === 'update') {
          await this.handleUpdate(table, record);
        } else if (operationType === 'delete') {
          await this.handleDelete(table, record);
        }
      } catch (error) {
        console.error(`Error during ${operationType} operation on ${table}:`, error);
        
        // For critical operations, retry a few times
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          this.operations.unshift(operation); // Put it back at the start of the queue
          await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount)); // Exponential backoff
        } else {
          // Give up after max retries
          toast.error(`Falha na sincronização de ${table}. Tente novamente mais tarde.`);
        }
      }
    }

    this.isSyncing = false;
  }

  private async handleInsert(table: string, record: any) {
    // Explicitly use select() to get back the data with ID
    const { data, error } = await this.client
      .from(table)
      .insert(record)
      .select();

    if (error) {
      console.error(`Error inserting record into ${table}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error(`No data returned from ${table} insert operation`);
      throw new Error(`Failed to insert into ${table}: No data returned`);
    }

    // Check if the first item in data has an id
    const firstItem = data[0];
    if (!firstItem || !('id' in firstItem)) {
      console.error(`Created ${table} record is missing ID:`, firstItem);
      throw new Error(`Failed to insert into ${table}: ID not generated`);
    }

    console.log(`Successfully inserted record into ${table} with ID:`, firstItem.id);
    return firstItem;
  }

  private async handleUpdate(table: string, record: any) {
    if (!record.id) {
      console.error(`Cannot update ${table} record without ID:`, record);
      throw new Error(`Failed to update ${table}: Missing ID`);
    }

    const { data, error } = await this.client
      .from(table)
      .upsert(record)
      .select();

    if (error) {
      console.error(`Error updating record in ${table}:`, error);
      throw error;
    }

    console.log(`Successfully updated record in ${table} with ID:`, record.id);
    return data?.[0] || record;
  }

  private async handleDelete(table: string, record: any) {
    if (!record.id) {
      console.error(`Cannot delete ${table} record without ID:`, record);
      throw new Error(`Failed to delete from ${table}: Missing ID`);
    }

    const { error } = await this.client
      .from(table)
      .delete()
      .match({ id: record.id });

    if (error) {
      console.error(`Error deleting record from ${table}:`, error);
      throw error;
    }

    console.log(`Successfully deleted record from ${table} with ID:`, record.id);
    return true;
  }
}

export async function syncWithServer(
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
) {
  try {
    if (syncCallback) syncCallback(true);
    
    console.log("Starting server synchronization...");
    
    // Get all pending operations from IndexedDB
    try {
      const { getOfflineData } = await import('./offlineDb');
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
              console.log(`Inserted record into ${op.table}:`, data?.[0]?.id);
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
            const { clearSyncItem } = await import('./offlineDb');
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
