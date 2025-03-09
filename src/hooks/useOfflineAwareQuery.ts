
import { useEffect, useState, useCallback } from 'react';
import { useQuery, UseQueryOptions, QueryKey, UseQueryResult } from '@tanstack/react-query';
import { getOfflineData, isOfflineStore } from '@/services/offlineSync';
import { syncWithServer } from '@/services/syncManager';

interface OfflineQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isOffline: boolean;
}

type QueryFn<T> = (...args: any[]) => Promise<T>;

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Data synchronization hook
export function useSyncData() {
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncWithServer(
        (syncing) => setIsSyncing(syncing),
        (error) => console.error('Sync error:', error)
      );
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { sync, isSyncing };
}

// Create a simple checker function to determine if a response is from an offline source
function isOfflineResponse(response: any): boolean {
  return response && typeof response === 'object' && 'isOffline' in response;
}

export function useOfflineAwareQuery<T>(
  queryKey: QueryKey,
  queryFn: QueryFn<T>,
  tableName: string | null = null,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>
): OfflineQueryResult<T> {
  const [offlineData, setOfflineData] = useState<T | undefined>(undefined);
  const [isOffline, setIsOffline] = useState(false);

  // Function to fetch offline data from IndexedDB
  const fetchOfflineData = async (table: string) => {
    if (!isOfflineStore(table)) {
      console.warn(`Table '${table}' is not configured for offline storage.`);
      return;
    }
    
    try {
      const data = await getOfflineData(table);
      if (data && data.length > 0) {
        console.log(`Retrieved ${data.length} records from offline storage for table '${table}'`);
        setOfflineData(data as unknown as T);
      } else {
        console.log(`No offline data available for table '${table}'`);
      }
    } catch (err) {
      console.error(`Error retrieving offline data for table '${table}':`, err);
    }
  };

  // Use the standard React Query hook with updated options
  const queryResult = useQuery<T, Error>({
    queryKey,
    queryFn,
    ...options,
    meta: {
      ...options?.meta,
      fallbackToOffline: !!tableName
    },
    retry: (failureCount: number, error: Error): boolean => {
      // On network errors, don't retry if we can fall back to offline data
      if (tableName && (error.message.includes('network') || !navigator.onLine)) {
        console.log('Network error detected, falling back to offline data');
        setIsOffline(true);
        fetchOfflineData(tableName);
        return false;
      }
      
      // Otherwise use the retry configuration from options or default
      if (options?.retry !== undefined) {
        if (typeof options.retry === 'function') {
          return options.retry(failureCount, error) as boolean;
        }
        // Fix for the operator '>' error - ensure we return a boolean
        return failureCount < (typeof options.retry === 'number' ? options.retry : 3);
      }
      
      return failureCount < 3;
    }
  });

  // Effect to handle offline fallback on error
  useEffect(() => {
    if (queryResult.error && tableName && !offlineData) {
      console.error('Query error, checking for offline data:', queryResult.error);
      setIsOffline(true);
      fetchOfflineData(tableName);
    }
  }, [queryResult.error, tableName]);

  // Return the appropriate data based on online/offline status
  if (isOffline && offlineData !== undefined) {
    // We're offline and have offline data
    return {
      data: offlineData,
      error: null,
      isLoading: false,
      isOffline: true
    };
  } else if (queryResult.data !== undefined) {
    // We have online data
    return {
      data: queryResult.data,
      error: null,
      isLoading: queryResult.isLoading,
      isOffline: false
    };
  } else {
    // Either loading or error state
    return {
      data: undefined,
      error: queryResult.error || null,
      isLoading: queryResult.isLoading,
      isOffline: isOffline
    };
  }
}
