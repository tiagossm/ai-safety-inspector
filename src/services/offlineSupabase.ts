
import { supabase } from "@/integrations/supabase/client";
import { saveForSync, getOfflineData } from "./offlineDb";
import { isValidTable, getValidatedTable, isOfflineStore } from "./tableValidation";

// Define simple result type
interface OperationResult {
  data: any;
  error: Error | null;
}

// Function to create insert operations
function createInsertOperation(tableName: string) {
  return async function(data: any): Promise<OperationResult> {
    try {
      if (navigator.onLine) {
        const validatedTable = getValidatedTable(tableName);
        // Use any to avoid deep type instantiation
        const result: any = await supabase.from(validatedTable).insert(data);
        if (result.error) throw result.error;
        return result;
      } else {
        // Generate a temporary ID if none exists
        if (!data.id) {
          data.id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        console.log(`Storing offline insert for table: ${tableName}`);
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
}

// Function to create update operations
function createUpdateOperation(tableName: string) {
  return function(data: any) {
    return {
      eq: async function(column: string, value: any): Promise<OperationResult> {
        try {
          if (navigator.onLine) {
            const validatedTable = getValidatedTable(tableName);
            // Use any to avoid deep type instantiation
            const result: any = await supabase
              .from(validatedTable)
              .update(data)
              .eq(column, value);
            
            if (result.error) throw result.error;
            return result;
          } else {
            // For offline update, we need the ID
            if (column === 'id') {
              data.id = value;
            }
            
            console.log(`Storing offline update for table: ${tableName}`);
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
}

// Function to create delete operations
function createDeleteOperation(tableName: string) {
  return function() {
    return {
      eq: async function(column: string, value: any): Promise<OperationResult> {
        try {
          if (navigator.onLine) {
            const validatedTable = getValidatedTable(tableName);
            // Use any to avoid deep type instantiation
            const result: any = await supabase
              .from(validatedTable)
              .delete()
              .eq(column, value);
            
            if (result.error) throw result.error;
            return result;
          } else {
            // For delete we just need the ID
            const data = { id: value };
            
            console.log(`Storing offline delete for table: ${tableName}`);
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
}

// Function to create select operations
function createSelectOperation(tableName: string) {
  return async function(columns: string = '*'): Promise<OperationResult> {
    try {
      if (navigator.onLine) {
        const validatedTable = getValidatedTable(tableName);
        // Use any to avoid deep type instantiation
        return await supabase.from(validatedTable).select(columns);
      } else {
        // When offline, use local data
        console.log(`Getting offline data for table: ${tableName}`);
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
}

// Main factory function for creating table operations
function createTableOperations(tableNameParam: string) {
  // Check if this table is in our allowed list
  if (!isValidTable(tableNameParam)) {
    console.error(`Invalid table name: ${tableNameParam}`);
    
    // Return operations with error handlers
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
  
  // Warn if this is not configured as an offline store
  if (!isOfflineStore(tableNameParam)) {
    console.warn(`Table "${tableNameParam}" is not configured as an offline store in offlineDb.ts`);
  }
  
  return {
    insert: createInsertOperation(tableNameParam),
    update: createUpdateOperation(tableNameParam),
    delete: createDeleteOperation(tableNameParam),
    select: createSelectOperation(tableNameParam)
  };
}

// Export the offlineSupabase object with a from method
export const offlineSupabase = {
  from: createTableOperations
};
