
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { offlineSupabase } from '@/services/offlineSupabase';
import { syncWithServer } from '@/services/syncManager';
import { saveForSync } from '@/services/offlineDb';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online. Syncing data...");
      syncWithServer();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Changes will be synced when you reconnect.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// Simplify types to avoid complex type issues
interface QueryResult {
  data?: any[];
  error?: any;
}

// Offline-aware query hook with simplified types
export const useOfflineAwareQuery = <T>(
  queryKey: QueryKey,
  tableName: string,
  options?: any
) => {
  const isOnline = useNetworkStatus();
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const result = await offlineSupabase.from(tableName).select() as any;
        
        // Handle different response formats
        if (!result) {
          return [] as T[];
        }
        
        // For offline query handler
        if (typeof result._getFilteredData === 'function') {
          const queryResult = await result._getFilteredData() as QueryResult;
          return (queryResult.data || []) as T[];
        }
        
        // For regular Supabase responses
        if (result && 'data' in result) {
          return (result.data || []) as T[];
        }
        
        return [] as T[];
      } catch (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        throw error;
      }
    },
    ...options,
    // If offline, rely on local cache and don't hit network
    networkMode: isOnline ? 'always' : 'offlineFirst'
  });
};

// Offline-aware mutation hook with proper Promise handling
export const useOfflineAwareMutation = <T>(
  tableName: string,
  queryKey: QueryKey,
  options?: any
) => {
  const queryClient = useQueryClient();
  const isOnline = useNetworkStatus();
  
  return useMutation({
    mutationFn: async (variables: {
      type: 'insert' | 'update' | 'delete';
      data: any;
      id?: string;
    }) => {
      const { type, data, id } = variables;
      
      let result;
      switch (type) {
        case 'insert':
          result = await offlineSupabase
            .from(tableName)
            .insert(data);
          break;
        case 'update': {
          // Get the update operation object
          const updateOperation = offlineSupabase
            .from(tableName)
            .update(data);
          
          // Then call eq() on the returned operation object
          result = await updateOperation.eq('id', id || data.id);
          break;
        }
        case 'delete': {
          // Get the delete operation object
          const deleteOperation = offlineSupabase
            .from(tableName)
            .delete();
          
          // Then call eq() on the returned operation object
          result = await deleteOperation.eq('id', id || data.id);
          break;
        }
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      
      if (!isOnline) {
        toast.info("You're offline. Changes will be synced when you reconnect.");
      }
    },
    onError: (error) => {
      console.error(`Error with ${tableName} operation:`, error);
      
      if (!isOnline) {
        toast.warning("Error occurred while offline. Will retry when online.");
      } else {
        toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
      }
    },
    ...options
  });
};

// Sync hook - manually trigger sync
export const useSyncData = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  
  const sync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncWithServer();
      if (result.success) {
        // Invalidate all queries to refresh data
        queryClient.invalidateQueries();
        toast.success(result.message || "Sync completed successfully");
      } else {
        toast.error(result.message || "Sync failed");
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return { sync, isSyncing };
};
