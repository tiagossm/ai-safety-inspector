
import { useState, useEffect } from 'react';
import { UseQueryResult, UseQueryOptions, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getOfflineData, isOfflineStore, syncWithServer } from '@/services/offlineSync';

// Hook to track network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  return isOnline;
}

// Hook to manage data synchronization
export function useSyncData() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const sync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      await syncWithServer();
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  return { sync, isSyncing };
}

export function useOfflineAwareQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData>
): UseQueryResult<TData> & { isOffline: boolean } {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineData, setOfflineData] = useState<TData | null>(null);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Check if we have offline data available
  useEffect(() => {
    async function checkOfflineData() {
      const tableName = queryKey[0];
      if (isOffline && tableName && isOfflineStore(tableName)) {
        try {
          const data = await getOfflineData(tableName);
          if (data && data.length > 0) {
            setOfflineData(data as unknown as TData);
          }
        } catch (error) {
          console.error('Error fetching offline data:', error);
        }
      }
    }

    if (isOffline) {
      checkOfflineData();
    }
  }, [isOffline, queryKey]);

  const result = useQuery({
    ...options,
    queryKey,
    queryFn,
    enabled: options?.enabled !== false && !isOffline,
  });

  if (isOffline && offlineData) {
    return {
      ...result,
      data: offlineData,
      isOffline: true,
      status: 'success' as const,
      isSuccess: true,
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      isLoadingError: false,
      isRefetchError: false,
      fetchStatus: 'idle' as const,
    };
  }

  return {
    ...result,
    isOffline,
  };
}
