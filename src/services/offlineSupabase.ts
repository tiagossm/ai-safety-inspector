
import { supabase } from "@/integrations/supabase/client";
import { saveForSync, getOfflineData } from "./offlineDb";
import { isValidTable, getValidatedTable } from "./tableValidation";

// Simple result type to avoid complex nesting
type OperationResult = {
  data: any;
  error: Error | null;
};

// Factory functions to create operations
const createInsertOperation = (tableName: string) => {
  return async (data: any): Promise<OperationResult> => {
    try {
      if (navigator.onLine) {
        const result = await supabase.from(tableName).insert(data);
        if (result.error) throw result.error;
        return result;
      } else {
        // Generate a temporary ID if none exists
        if (!data.id) {
          data.id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        await saveForSync(tableName, 'insert', data);
        return { data: [data], error: null };
      }
    } catch (error) {
      console.error(`Error in offline insert for ${tableName}:`, error);
      // Always fall back to offline storage on error
      await saveForSync(tableName, 'insert', data);
      return { data: [data], error: null };
    }
  };
};

const createUpdateOperation = (tableName: string) => {
  return (data: any) => {
    return {
      eq: async (column: string, value: any): Promise<OperationResult> => {
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
            await saveForSync(tableName, 'update', data);
            return { data: [data], error: null };
          }
        } catch (error) {
          console.error(`Error in offline update for ${tableName}:`, error);
          // Always fall back to offline storage on error
          if (column === 'id') {
            data.id = value;
          }
          await saveForSync(tableName, 'update', data);
          return { data: [data], error: null };
        }
      }
    };
  };
};

const createDeleteOperation = (tableName: string) => {
  return () => {
    return {
      eq: async (column: string, value: any): Promise<OperationResult> => {
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
            await saveForSync(tableName, 'delete', data);
            return { data: [], error: null };
          }
        } catch (error) {
          console.error(`Error in offline delete for ${tableName}:`, error);
          // Always fall back to offline storage on error
          const data = { id: value };
          await saveForSync(tableName, 'delete', data);
          return { data: [], error: null };
        }
      }
    };
  };
};

const createSelectOperation = (tableName: string) => {
  return async (columns: string = '*'): Promise<OperationResult> => {
    try {
      if (navigator.onLine) {
        return await supabase.from(tableName).select(columns);
      } else {
        // When offline, use local data
        const offlineData = await getOfflineData(tableName);
        return { 
          data: offlineData, 
          error: null 
        };
      }
    } catch (error) {
      console.error(`Error in offline select for ${tableName}:`, error);
      // On error, try to use offline data as fallback
      const offlineData = await getOfflineData(tableName);
      return { 
        data: offlineData, 
        error: null 
      };
    }
  };
};

// Main offlineSupabase API
export const offlineSupabase = {
  from: (tableNameParam: string) => {
    // Type check the table name
    if (!isValidTable(tableNameParam)) {
      console.error(`Invalid table name: ${tableNameParam}`);
      return {
        insert: async () => ({ 
          data: null, 
          error: new Error(`Invalid table: ${tableNameParam}`) 
        }),
        update: () => ({
          eq: async () => ({ 
            data: null, 
            error: new Error(`Invalid table: ${tableNameParam}`) 
          })
        }),
        delete: () => ({
          eq: async () => ({ 
            data: null, 
            error: new Error(`Invalid table: ${tableNameParam}`) 
          })
        }),
        select: async () => ({ 
          data: [], 
          error: new Error(`Invalid table: ${tableNameParam}`) 
        })
      };
    }
    
    // Now we know it's a valid table name
    const tableName = getValidatedTable(tableNameParam);
    
    // Return the table operations object with factory-created methods
    return {
      insert: createInsertOperation(tableName),
      update: createUpdateOperation(tableName),
      delete: createDeleteOperation(tableName),
      select: createSelectOperation(tableName)
    };
  }
};
