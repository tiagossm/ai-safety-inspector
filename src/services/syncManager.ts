
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
  
  console.log(`Syncing ${pendingRequests.length} pending requests`);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Process each request
  for (const request of pendingRequests) {
    try {
      let result;
      
      // Skip if max retries reached
      if (request.retries >= MAX_RETRIES) {
        console.error(`Request ${request.id} has reached max retries, will be skipped`);
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
      
    } catch (error) {
      console.error(`Error syncing request ${request.id}:`, error);
      
      // Increment retry count
      await incrementRetryCount(request);
      failureCount++;
    }
  }
  
  const result = {
    success: failureCount === 0,
    message: `Sync completed: ${successCount} succeeded, ${failureCount} failed`
  };
  
  if (failureCount > 0) {
    toast.error(`Sync partially completed. ${failureCount} items failed to sync.`);
  } else if (successCount > 0) {
    toast.success(`Sync completed successfully. ${successCount} items synced.`);
  }
  
  console.log(result.message);
  return result;
}
