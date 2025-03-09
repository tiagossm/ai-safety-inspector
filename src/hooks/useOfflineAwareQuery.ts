
import { useEffect, useState } from 'react';
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { getOfflineData, isOfflineStore } from '@/services/offlineSync';

interface OfflineQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isOffline: boolean;
}

type QueryFn<T> = (...args: any[]) => Promise<T>;

// Create a simple checker function to determine if a response is from an offline source
function isOfflineResponse(response: any): boolean {
  return response && typeof response === 'object' && 'isOffline' in response;
}

export function useOfflineAwareQuery<T>(
  queryKey: QueryKey,
  queryFn: QueryFn<T>,
  tableName: string | null = null,
  options?: UseQueryOptions<T>
): OfflineQueryResult<T> {
  const [offlineData, setOfflineData] = useState<T | undefined>(undefined);
  const [isOffline, setIsOffline] = useState(false);

  // Use the standard React Query hook
  const queryResult = useQuery<T>({
    queryKey,
    queryFn,
    ...options,
    onError: (error) => {
      console.error('Query error:', error);
      // Only fallback to offline mode for network errors and when tableName is provided
      if (tableName && error instanceof Error && 
          (error.message.includes('network') || !navigator.onLine)) {
        setIsOffline(true);
        fetchOfflineData(tableName);
      }
      
      // Call the original onError if provided
      if (options?.onError) {
        options.onError(error);
      }
    }
  });

  // Function to fetch offline data from IndexedDB
  async function fetchOfflineData(table: string) {
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
  }

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
      error: queryResult.error instanceof Error ? queryResult.error : null,
      isLoading: queryResult.isLoading,
      isOffline: isOffline
    };
  }
}
