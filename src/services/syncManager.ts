
import { supabase } from '@/integrations/supabase/client';
import { getSyncQueue, clearSyncItem } from './offlineDb';

export async function syncWithServer(
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
): Promise<boolean> {
  try {
    if (syncCallback) {
      syncCallback(true);
    }
    
    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
      if (syncCallback) {
        syncCallback(false);
      }
      return true;
    }
    
    console.log(`Syncing ${queue.length} items with server...`);
    
    for (const item of queue) {
      try {
        const { table, operation, data } = item;
        
        switch (operation) {
          case 'insert':
            await supabase.from(table).insert(data);
            break;
          case 'update':
            await supabase.from(table).update(data).eq('id', data.id);
            break;
          case 'delete':
            await supabase.from(table).delete().eq('id', data.id);
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
    
    return remainingQueue.length === 0;
  } catch (error) {
    console.error('Sync failed:', error);
    
    if (errorCallback && error instanceof Error) {
      errorCallback(error);
    }
    
    if (syncCallback) {
      syncCallback(false);
    }
    
    return false;
  }
}
