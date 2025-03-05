
import { supabase } from '@/integrations/supabase/client';
import { getSyncQueue, clearSyncItem } from './offlineDb';
import { getValidatedTable, isValidTable } from './tableValidation';

// Simple synchronization result type
interface SyncResult {
  success: boolean;
  message?: string;
}

export async function syncWithServer(
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
): Promise<SyncResult> {
  try {
    if (syncCallback) {
      syncCallback(true);
    }
    
    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
      if (syncCallback) {
        syncCallback(false);
      }
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
        
        const validatedTable = getValidatedTable(table);
        
        // Process each operation type separately to avoid deep type instantiation
        if (operation === 'insert') {
          try {
            const result = await supabase.from(validatedTable).insert(data);
            if (result.error) throw result.error;
          } catch (operationError) {
            throw operationError;
          }
        } 
        else if (operation === 'update') {
          try {
            const result = await supabase.from(validatedTable).update(data).eq('id', data.id);
            if (result.error) throw result.error;
          } catch (operationError) {
            throw operationError;
          }
        } 
        else if (operation === 'delete') {
          try {
            const result = await supabase.from(validatedTable).delete().eq('id', data.id);
            if (result.error) throw result.error;
          } catch (operationError) {
            throw operationError;
          }
        }
        
        // Clear item from sync queue after successful sync
        await clearSyncItem(item.id);
        successCount++;
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
