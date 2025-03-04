
import { supabase } from "@/integrations/supabase/client";
import { saveForSync, getOfflineData } from "./offlineDb";
import { isValidTable, getValidatedTable, type AllowedTableName } from "./tableValidation";

// Define a simple result type to be used throughout
interface OfflineOperationResult {
  data: any;
  error: null | Error;
}

// Define simple function types 
type EqFilterFn = (column: string, value: any) => Promise<OfflineOperationResult>;
type InsertFn = (data: any) => Promise<OfflineOperationResult>;
type SelectFn = (columns?: string) => Promise<OfflineOperationResult>;

// Interface for objects with eq method
interface WithEqFilter {
  eq: EqFilterFn;
}

// Define update and delete function types that return the WithEqFilter interface
type UpdateFn = (data: any) => WithEqFilter;
type DeleteFn = () => WithEqFilter;

// Main interface using the simple flat types
interface TableOperations {
  insert: InsertFn;
  update: UpdateFn;
  delete: DeleteFn;
  select: SelectFn;
}

// Implementation of the table operations
function createTableOperations(tableName: AllowedTableName): TableOperations {
  return {
    // Insert operation
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
    
    // Update operation
    update: (data: any): WithEqFilter => {
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
    },
    
    // Delete operation
    delete: (): WithEqFilter => {
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
    },
    
    // Select operation
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

// Create an invalid table operations object for type errors
function createInvalidTableOperations(tableNameParam: string): TableOperations {
  const errorObj: OfflineOperationResult = { 
    data: null, 
    error: new Error(`Invalid table: ${tableNameParam}`) 
  };

  // Create a reusable error filter function
  const errorEqFilter: EqFilterFn = async (): Promise<OfflineOperationResult> => errorObj;
  
  // Create a reusable error filter object
  const errorWithEq: WithEqFilter = { eq: errorEqFilter };
  
  return {
    insert: async (): Promise<OfflineOperationResult> => errorObj,
    update: (): WithEqFilter => errorWithEq,
    delete: (): WithEqFilter => errorWithEq,
    select: async (): Promise<OfflineOperationResult> => ({ 
      data: [], 
      error: new Error(`Invalid table: ${tableNameParam}`) 
    })
  };
}

// Offline-capable version of supabase operations
export const offlineSupabase = {
  from: (tableNameParam: string): TableOperations => {
    // Type check the table name
    if (!isValidTable(tableNameParam)) {
      console.error(`Invalid table name: ${tableNameParam}`);
      // Return a dummy object that won't crash but will fail gracefully
      return createInvalidTableOperations(tableNameParam);
    }
    
    // Now we know it's a valid table name
    const tableName = tableNameParam as AllowedTableName;
    return createTableOperations(tableName);
  }
};
