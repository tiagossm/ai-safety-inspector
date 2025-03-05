
import { supabase } from "@/integrations/supabase/client";
import { saveForSync, getOfflineData } from "./offlineDb";
import { isValidTable, getValidatedTable } from "./tableValidation";

// Define basic result type
type OperationResult = {
  data: any;
  error: Error | null;
};

// Create standalone functions to avoid nested function issues
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

// Define the interfaces without recursive structures
interface UpdateOperation {
  eq: (column: string, value: any) => Promise<OperationResult>;
}

interface DeleteOperation {
  eq: (column: string, value: any) => Promise<OperationResult>;
}

interface TableOperations {
  insert: (data: any) => Promise<OperationResult>;
  update: (data: any) => UpdateOperation;
  delete: () => DeleteOperation;
  select: (columns?: string) => Promise<OperationResult>;
}

// Helper functions that return well-defined objects
function createUpdateOperation(tableName: string, data: any): UpdateOperation {
  return {
    eq: (column: string, value: any) => executeUpdateEq(tableName, data, column, value)
  };
}

function createDeleteOperation(tableName: string): DeleteOperation {
  return {
    eq: (column: string, value: any) => executeDeleteEq(tableName, column, value)
  };
}

// Main offlineSupabase API with explicit return types
export const offlineSupabase = {
  from: (tableNameParam: string): TableOperations => {
    // Type check the table name
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
    
    // Return a table operations object that uses the standalone functions
    return {
      insert: (data: any) => executeInsert(tableNameParam, data),
      update: (data: any) => createUpdateOperation(tableNameParam, data),
      delete: () => createDeleteOperation(tableNameParam),
      select: (columns?: string) => executeSelect(tableNameParam, columns)
    };
  }
};
