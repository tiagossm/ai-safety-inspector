
import { supabase } from '@/integrations/supabase/client';
import { getSyncQueue, clearSyncItem } from './offlineDb';
import { getValidatedTable, type AllowedTableName, isValidTable } from './tableValidation';

export async function syncWithServer(
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
): Promise<{ success: boolean; message?: string }> {
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
        
        switch (operation) {
          case 'insert':
            await supabase.from(validatedTable).insert(data);
            break;
          case 'update':
            await supabase.from(validatedTable).update(data).eq('id', data.id);
            break;
          case 'delete':
            await supabase.from(validatedTable).delete().eq('id', data.id);
            break;
        }
        
        // Clear item from sync queue after successful sync
        await clearSyncItem(item.id);
      } catch (itemError) {
        console.error(`Failed to sync item ${item.id}:`, itemError);
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
        ? "All items synced successfully" 
        : `${remainingQueue.length} items failed to sync`
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
