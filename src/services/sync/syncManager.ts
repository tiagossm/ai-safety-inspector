
import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { SyncOperation } from "./types";
import { handleInsert, handleUpdate, handleDelete } from "./syncOperations";

export class SyncManager {
  private client: SupabaseClient;
  private operations: SyncOperation[] = [];
  private isSyncing: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  addOperation(operation: SyncOperation) {
    this.operations.push(operation);
    if (!this.isSyncing) {
      this.sync();
    }
  }

  private async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    while (this.operations.length > 0) {
      const operation = this.operations.shift();
      if (!operation) break;

      const { table, operationType, record } = operation;
      this.retryCount = 0;

      try {
        if (operationType === 'insert') {
          await handleInsert(this.client, table, record);
        } else if (operationType === 'update') {
          await handleUpdate(this.client, table, record);
        } else if (operationType === 'delete') {
          await handleDelete(this.client, table, record);
        }
      } catch (error) {
        console.error(`Error during ${operationType} operation on ${table}:`, error);
        
        // For critical operations, retry a few times
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          this.operations.unshift(operation); // Put it back at the start of the queue
          await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount)); // Exponential backoff
        } else {
          // Give up after max retries
          toast.error(`Falha na sincronização de ${table}. Tente novamente mais tarde.`);
        }
      }
    }

    this.isSyncing = false;
  }
}
