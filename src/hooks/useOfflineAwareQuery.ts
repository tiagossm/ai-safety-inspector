
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { offlineSupabase } from '@/services/offlineSupabase';
import { syncWithServer } from '@/services/syncManager';

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

// Offline-aware query hook
export const useOfflineAwareQuery = <T>(
  queryKey: QueryKey,
  tableName: string,
  options?: any
) => {
  const isOnline = useNetworkStatus();
  
  return useQuery<T[], Error>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await offlineSupabase
        .from(tableName)
        .select('*');
        
      if (error) throw error;
      return (data || []) as T[];
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
      type: 'INSERT' | 'UPDATE' | 'DELETE';
      data: any;
      id?: string;
    }) => {
      const { type, data, id } = variables;
      
      let result;
      switch (type) {
        case 'INSERT':
          result = await offlineSupabase
            .from(tableName)
            .insert(data);
          break;
        case 'UPDATE': {
          // Get the update operation object first
          const updateOperation = await offlineSupabase
            .from(tableName)
            .update(data);
          
          // Then call eq() on the returned operation object
          result = await updateOperation.eq('id', id || data.id);
          break;
        }
        case 'DELETE': {
          // Get the delete operation object first
          const deleteOperation = await offlineSupabase
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
        toast.error(`Error: ${(error as Error).message || 'Unknown error occurred'}`);
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
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return { sync, isSyncing };
};
