
/**
 * Represents a sync operation to be processed
 */
export interface SyncOperation {
  table: string;
  operationType: 'insert' | 'update' | 'delete';
  record: any;
}

/**
 * Represents an item in the sync queue
 */
export interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}
