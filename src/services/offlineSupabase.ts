
import { supabase } from "@/integrations/supabase/client";
import { saveForSync, getOfflineData } from "./offlineDb";
import { isValidTable, getValidatedTable, type AllowedTableName } from "./tableValidation";

// Define more specific return types for operations
type OfflineOperationResult = {
  data: any;
  error: null | Error;
};

// Create specific, non-recursive return types
interface DeleteOperation {
  eq: (column: string, value: any) => Promise<OfflineOperationResult>;
}

interface UpdateOperation {
  eq: (column: string, value: any) => Promise<OfflineOperationResult>;
}

// Table method interfaces to break recursive type references
interface InsertMethod {
  (data: any): Promise<OfflineOperationResult>;
}

interface UpdateMethod {
  (data: any): Promise<UpdateOperation>;
}

interface DeleteMethod {
  (): Promise<DeleteOperation>;
}

interface SelectMethod {
  (columns?: string): Promise<OfflineOperationResult>;
}

// Complete table methods return type
interface TableMethods {
  insert: InsertMethod;
  update: UpdateMethod;
  delete: DeleteMethod;
  select: SelectMethod;
}

// Offline-capable version of supabase operations
export const offlineSupabase = {
  from: (tableNameParam: string): TableMethods => {
    // Type check the table name
    if (!isValidTable(tableNameParam)) {
      console.error(`Invalid table name: ${tableNameParam}`);
      // Return a dummy object that won't crash but will fail gracefully
      return {
        insert: async (): Promise<OfflineOperationResult> => ({ data: null, error: new Error(`Invalid table: ${tableNameParam}`) }),
        update: async (): Promise<UpdateOperation> => ({ 
          eq: async () => ({ data: null, error: new Error(`Invalid table: ${tableNameParam}`) }) 
        }),
        delete: async (): Promise<DeleteOperation> => ({ 
          eq: async () => ({ data: null, error: new Error(`Invalid table: ${tableNameParam}`) }) 
        }),
        select: async (): Promise<OfflineOperationResult> => ({ data: [], error: new Error(`Invalid table: ${tableNameParam}`) })
      };
    }
    
    // Now we know it's a valid table name
    const tableName = tableNameParam as AllowedTableName;
    
    return {
      insert: async (data: any): Promise<OfflineOperationResult> => {
        try {
          if (navigator.onLine) {
            const result = await supabase
              .from(tableName)
              .insert(data);
            
            if (result.error) throw result.error;
            return result;
          } else {
            // Generate a temporary ID if none exists
            if (!data.id) {
              data.id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            await saveForSync(tableName, 'INSERT', data);
            return { data: [data], error: null };
          }
        } catch (error) {
          console.error(`Error in offline insert for ${tableName}:`, error);
          // Always fall back to offline storage on error
          await saveForSync(tableName, 'INSERT', data);
          return { data: [data], error: null };
        }
      },
      
      update: async (data: any): Promise<UpdateOperation> => {
        return {
          eq: async (column: string, value: any): Promise<OfflineOperationResult> => {
            try {
              if (navigator.onLine) {
                const result = await supabase
                  .from(tableName)
                  .update(data)
                  .eq(column, value);
                
                if (result.error) throw result.error;
                return result;
              } else {
                // For offline update, we need the ID
                if (column === 'id') {
                  data.id = value;
                }
                await saveForSync(tableName, 'UPDATE', data);
                return { data: [data], error: null };
              }
            } catch (error) {
              console.error(`Error in offline update for ${tableName}:`, error);
              // Always fall back to offline storage on error
              if (column === 'id') {
                data.id = value;
              }
              await saveForSync(tableName, 'UPDATE', data);
              return { data: [data], error: null };
            }
          }
        };
      },
      
      delete: async (): Promise<DeleteOperation> => {
        return {
          eq: async (column: string, value: any): Promise<OfflineOperationResult> => {
            try {
              if (navigator.onLine) {
                const result = await supabase
                  .from(tableName)
                  .delete()
                  .eq(column, value);
                
                if (result.error) throw result.error;
                return result;
              } else {
                // For delete we just need the ID
                const data = { id: value };
                await saveForSync(tableName, 'DELETE', data);
                return { data: [], error: null };
              }
            } catch (error) {
              console.error(`Error in offline delete for ${tableName}:`, error);
              // Always fall back to offline storage on error
              const data = { id: value };
              await saveForSync(tableName, 'DELETE', data);
              return { data: [], error: null };
            }
          }
        };
      },
      
      select: async (columns: string = '*'): Promise<OfflineOperationResult> => {
        try {
          if (navigator.onLine) {
            return await supabase.from(tableName).select(columns);
          } else {
            // When offline, use local data
            const offlineData = await getOfflineData(tableName);
            return { 
              data: offlineData.map(item => item.data), 
              error: null 
            };
          }
        } catch (error) {
          console.error(`Error in offline select for ${tableName}:`, error);
          // On error, try to use offline data as fallback
          const offlineData = await getOfflineData(tableName);
          return { 
            data: offlineData.map(item => item.data), 
            error: null 
          };
        }
      }
    };
  }
};
