
import { supabase } from "@/integrations/supabase/client";
import { saveForSync, getOfflineData } from "./offlineDb";
import { isValidTable, getValidatedTable, type AllowedTableName } from "./tableValidation";

// Simple result type without nesting
interface OfflineOperationResult {
  data: any;
  error: null | Error;
}

// Define operation functions separately to avoid deep nesting
type SelectFunction = () => Promise<OfflineOperationResult>;
type EqFunction = (column: string, value: any) => Promise<OfflineOperationResult>;
type InsertFunction = (data: any) => Promise<OfflineOperationResult>;

// Define operation objects with simpler types
interface DeleteOperations {
  eq: EqFunction;
}

interface UpdateOperations {
  eq: EqFunction;
}

// Define the table operations object
interface TableOperations {
  select: SelectFunction;
  insert: InsertFunction;
  update: (data: any) => UpdateOperations;
  delete: () => DeleteOperations;
}

// Create factory functions for operations to avoid recursive types
function createUpdateOperations(tableName: string, data: any): UpdateOperations {
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
}

function createDeleteOperations(tableName: string): DeleteOperations {
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
}

// Main function to generate table operations
function createTableOperations(tableName: string): TableOperations {
  return {
    select: async (columns: string = '*'): Promise<OfflineOperationResult> => {
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
    },
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
          await saveForSync(tableName, 'insert', data);
          return { data: [data], error: null };
        }
      } catch (error) {
        console.error(`Error in offline insert for ${tableName}:`, error);
        // Always fall back to offline storage on error
        await saveForSync(tableName, 'insert', data);
        return { data: [data], error: null };
      }
    },
    update: (data: any) => createUpdateOperations(tableName, data),
    delete: () => createDeleteOperations(tableName)
  };
}

// Invalid table error factory to avoid duplication
function createInvalidTableError(tableName: string): OfflineOperationResult {
  return { 
    data: null, 
    error: new Error(`Invalid table: ${tableName}`) 
  };
}

// Main offlineSupabase export
export const offlineSupabase = {
  from: (tableNameParam: string) => {
    // Type check the table name
    if (!isValidTable(tableNameParam)) {
      console.error(`Invalid table name: ${tableNameParam}`);
      
      // Return object with same shape but all methods return errors
      return {
        select: async () => createInvalidTableError(tableNameParam),
        insert: async () => createInvalidTableError(tableNameParam),
        update: () => ({
          eq: async () => createInvalidTableError(tableNameParam)
        }),
        delete: () => ({
          eq: async () => createInvalidTableError(tableNameParam)
        })
      };
    }
    
    // Now we know it's a valid table name
    const tableName = getValidatedTable(tableNameParam);
    
    // Return table operations using our factory
    return createTableOperations(tableName);
  }
};
