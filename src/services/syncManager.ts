
import { supabase } from '@/integrations/supabase/client';
import { getSyncQueue, clearSyncItem } from './offlineDb';
import { getValidatedTable, isValidTable } from './tableValidation';

// Simple synchronization result type
interface SyncResult {
  success: boolean;
  message?: string;
}

// Create dedicated type for items in sync queue
interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

// Simplified response type to avoid deep type nesting
type SupabaseResponse = {
  error: any | null;
  data?: any;
  status?: number;
  statusText?: string;
  count?: number;
}

// Process each operation type with a dedicated function
async function processInsertOperation(table: string, data: any): Promise<void> {
  console.log(`Processing insert operation for table: ${table}`);
  const validatedTable = getValidatedTable(table);
  
  // Use any type assertion to fix infinite type instantiation
  const response = await supabase.from(validatedTable).insert(data) as any as SupabaseResponse;
  
  if (response.error) {
    console.error(`Error in sync insert operation for table ${table}:`, response.error);
    throw response.error;
  }
  console.log(`Successfully inserted data into ${table}`);
}

async function processUpdateOperation(table: string, data: any): Promise<void> {
  console.log(`Processing update operation for table: ${table}`);
  const validatedTable = getValidatedTable(table);
  
  // Use any type assertion to fix infinite type instantiation
  const response = await supabase.from(validatedTable).update(data).eq('id', data.id) as any as SupabaseResponse;
  
  if (response.error) {
    console.error(`Error in sync update operation for table ${table}:`, response.error);
    throw response.error;
  }
  console.log(`Successfully updated data in ${table}`);
}

async function processDeleteOperation(table: string, data: any): Promise<void> {
  console.log(`Processing delete operation for table: ${table}`);
  const validatedTable = getValidatedTable(table);
  
  // Use any type assertion to fix infinite type instantiation 
  const response = await supabase.from(validatedTable).delete().eq('id', data.id) as any as SupabaseResponse;
  
  if (response.error) {
    console.error(`Error in sync delete operation for table ${table}:`, response.error);
    throw response.error;
  }
  console.log(`Successfully deleted data from ${table}`);
}

// Main sync function 
export async function syncWithServer(
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
): Promise<SyncResult> {
  try {
    if (syncCallback) {
      syncCallback(true);
    }
    
    const queue = await getSyncQueue() as SyncQueueItem[];
    
    if (queue.length === 0) {
      if (syncCallback) {
        syncCallback(false);
      }
      console.log('No items to sync. Queue is empty.');
      return { success: true };
    }
    
    console.log(`Syncing ${queue.length} items with server...`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const item of queue) {
      try {
        const { table, operation, data } = item;
        
        // Validate table name before using it
        if (!isValidTable(table)) {
          console.error(`Invalid table name: ${table}, skipping sync`);
          await clearSyncItem(item.id);
          continue;
        }
        
        // Process each operation type using the dedicated functions
        if (operation === 'insert') {
          await processInsertOperation(table, data);
        } 
        else if (operation === 'update') {
          await processUpdateOperation(table, data);
        } 
        else if (operation === 'delete') {
          await processDeleteOperation(table, data);
        }
        else {
          console.warn(`Unknown operation type: ${operation}, skipping`);
        }
        
        // Clear item from sync queue after successful sync
        await clearSyncItem(item.id);
        successCount++;
        console.log(`Successfully synced item ${item.id} (${operation} on ${table})`);
      } catch (itemError) {
        console.error(`Failed to sync item ${item.id}:`, itemError);
        failureCount++;
        // Continue with next item
      }
    }
    
    // Check if there are any remaining items in the queue
    const remainingQueue = await getSyncQueue();
    
    if (syncCallback) {
      syncCallback(false);
    }
    
    return { 
      success: remainingQueue.length === 0,
      message: remainingQueue.length === 0 
        ? `All ${successCount} items synced successfully` 
        : `${successCount} items synced, ${failureCount} items failed to sync`
    };
  } catch (error) {
    console.error('Sync failed:', error);
    
    if (errorCallback && error instanceof Error) {
      errorCallback(error);
    }
    
    if (syncCallback) {
      syncCallback(false);
    }
    
    return { 
      success: false,
      message: error instanceof Error ? error.message : "Unknown error during sync"
    };
  }
}
