
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPendingRequests, removePendingRequest, incrementRetryCount } from "./offlineDb";
import { isValidTable } from "./tableValidation";

// Maximum retry attempts
const MAX_RETRIES = 5;

// Synchronize all pending requests with the server
export async function syncWithServer() {
  if (!navigator.onLine) {
    console.log('Cannot sync while offline');
    return { success: false, message: 'Cannot sync while offline' };
  }
  
  // Get all pending requests
  const pendingRequests = await getPendingRequests();
  
  if (pendingRequests.length === 0) {
    console.log('No pending requests to sync');
    return { success: true, message: 'No pending requests to sync' };
  }
  
  console.log(`Starting sync for ${pendingRequests.length} pending requests`);
  
  let successCount = 0;
  let failureCount = 0;
  const errors = [];
  
  // Process each request
  for (const request of pendingRequests) {
    try {
      console.log(`Syncing request: ${request.table}.${request.operation} for ID: ${request.data.id || 'new item'}`);
      
      let result;
      
      // Skip if max retries reached
      if (request.retries >= MAX_RETRIES) {
        console.error(`Request ${request.id} has reached max retries (${MAX_RETRIES}), will be skipped`);
        errors.push({
          id: request.id,
          table: request.table,
          reason: `Max retries (${MAX_RETRIES}) reached`
        });
        failureCount++;
        continue;
      }
      
      // Execute the request - with type checking for table names
      if (!isValidTable(request.table)) {
        throw new Error(`Invalid table name: ${request.table}`);
      }
      
      switch (request.operation) {
        case 'INSERT':
          result = await supabase
            .from(request.table)
            .insert(request.data);
          break;
        case 'UPDATE':
          result = await supabase
            .from(request.table)
            .update(request.data)
            .eq('id', request.data.id);
          break;
        case 'DELETE':
          result = await supabase
            .from(request.table)
            .delete()
            .eq('id', request.data.id);
          break;
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // If successful, remove from pending requests
      await removePendingRequest(request.id);
      successCount++;
      console.log(`Sync successful for request: ${request.id}`);
      
    } catch (error) {
      console.error(`Error syncing request ${request.id}:`, error);
      errors.push({
        id: request.id,
        table: request.table,
        error: error.message || 'Unknown error'
      });
      
      // Increment retry count
      await incrementRetryCount(request);
      failureCount++;
    }
  }
  
  const result = {
    success: failureCount === 0,
    message: `Sync completed: ${successCount} succeeded, ${failureCount} failed`,
    details: {
      successCount,
      failureCount,
      errors
    }
  };
  
  if (failureCount > 0) {
    toast.error(`Sync partially completed. ${failureCount} items failed to sync.`);
  } else if (successCount > 0) {
    toast.success(`Sync completed successfully. ${successCount} items synced.`);
  }
  
  console.log('Sync result:', result);
  return result;
}

// Function to register for sync events
export function registerSyncEvents() {
  // Listen for sync events from the service worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_NEEDED') {
        console.log('Received sync request from service worker');
        syncWithServer().then(result => {
          console.log('Sync requested by service worker completed:', result);
        });
      }
    });
  }
  
  // Register a background sync if supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      // Check if SyncManager is available
      if ('sync' in registration) {
        // Register for sync event
        registration.sync.register('sync-pending-data')
          .then(() => {
            console.log('Background sync registered successfully');
          })
          .catch(err => {
            console.error('Background sync registration failed:', err);
          });
      } else {
        console.log('SyncManager not available in this browser');
      }
    });
  }
}
