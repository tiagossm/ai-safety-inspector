
import { supabase } from "@/integrations/supabase/client";
import { saveForSync, getOfflineData } from "./offlineDb";
import { isValidTable, getValidatedTable, isOfflineStore } from "./tableValidation";

// Define simple result type
interface OperationResult {
  data: any;
  error: Error | null;
}

// Simpler interface definitions without nested types
interface TableOperations {
  insert: (data: any) => Promise<OperationResult>;
  update: (data: any) => { eq: (column: string, value: any) => Promise<OperationResult> };
  delete: () => { eq: (column: string, value: any) => Promise<OperationResult> };
  select: (columns?: string) => Promise<OperationResult>;
}

// Standalone operation functions to avoid nesting
async function executeInsert(tableName: string, data: any): Promise<OperationResult> {
  try {
    if (navigator.onLine) {
      const validatedTable = getValidatedTable(tableName);
      const result = await supabase.from(validatedTable).insert(data);
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
}

async function executeUpdateEq(
  tableName: string, 
  data: any, 
  column: string, 
  value: any
): Promise<OperationResult> {
  try {
    if (navigator.onLine) {
      const validatedTable = getValidatedTable(tableName);
      const result = await supabase
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

async function executeDeleteEq(
  tableName: string, 
  column: string, 
  value: any
): Promise<OperationResult> {
  try {
    if (navigator.onLine) {
      const validatedTable = getValidatedTable(tableName);
      const result = await supabase
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

async function executeSelect(tableName: string, columns: string = '*'): Promise<OperationResult> {
  try {
    if (navigator.onLine) {
      const validatedTable = getValidatedTable(tableName);
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
}

// Main factory function for creating table operations
function createTableOperations(tableNameParam: string): TableOperations {
  // Check if this table is in our allowed list
  if (!isValidTable(tableNameParam)) {
    console.error(`Invalid table name: ${tableNameParam}`);
    
    // Return a TableOperations object with error handlers
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
    insert: (data: any) => executeInsert(tableNameParam, data),
    update: (data: any) => ({
      eq: (column: string, value: any) => executeUpdateEq(tableNameParam, data, column, value)
    }),
    delete: () => ({
      eq: (column: string, value: any) => executeDeleteEq(tableNameParam, column, value)
    }),
    select: (columns?: string) => executeSelect(tableNameParam, columns)
  };
}

// Export the offlineSupabase object with a from method
export const offlineSupabase = {
  from: createTableOperations
};
