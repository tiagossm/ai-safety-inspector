
import { saveForSync, getOfflineData } from './offlineDb';
import { AllowedTableName, isOfflineStore } from './tableValidation';

// Define a common response type
type OfflineResponse<T = any> = {
  data: T | null;
  error: Error | null;
};

// Define an interface for the offline query result
interface OfflineQueryResult {
  data: any[] | null;
  error: Error | null; 
}

// Simplified offline Supabase client that mimics the real Supabase client API
// but operates on IndexedDB
class OfflineSupabase {
  from(table: string) {
    // If the table is not allowed for offline operations, throw an error
    if (!isOfflineStore(table)) {
      throw new Error(`Table '${table}' is not supported for offline operations`);
    }

    return new OfflineTableHandler(table as AllowedTableName);
  }
}

class OfflineTableHandler {
  private table: string;
  
  constructor(table: string) {
    this.table = table;
  }
  
  select() {
    return new OfflineQueryHandler(this.table);
  }
  
  async insert(data: any) {
    // Queue for sync when back online
    await saveForSync(this.table, 'insert', data);
    
    // Return success response that mimics Supabase response
    return {
      data: [data],
      error: null
    };
  }
  
  update(data: any) {
    return new OfflineUpdateHandler(this.table, data);
  }
  
  delete() {
    return new OfflineDeleteHandler(this.table);
  }
}

class OfflineQueryHandler {
  private table: string;
  private filters: Array<{column: string, value: any, operator: 'eq' | 'in'}> = [];
  private orderBy?: {column: string, ascending: boolean};
  
  constructor(table: string) {
    this.table = table;
  }
  
  eq(column: string, value: any) {
    this.filters.push({column, value, operator: 'eq'});
    return this;
  }
  
  in(column: string, values: any[]) {
    this.filters.push({column, value: values, operator: 'in'});
    return this;
  }
  
  order(column: string, options?: {ascending?: boolean}) {
    this.orderBy = {
      column,
      ascending: options?.ascending !== false
    };
    return this;
  }
  
  // Exposed for useOfflineAwareQuery
  async _getFilteredData(): Promise<OfflineQueryResult> {
    try {
      const allData = await getOfflineData(this.table);
      
      // Apply filters
      let filteredData = allData;
      for (const filter of this.filters) {
        if (filter.operator === 'eq') {
          filteredData = filteredData.filter(item => item[filter.column] === filter.value);
        } else if (filter.operator === 'in') {
          filteredData = filteredData.filter(item => filter.value.includes(item[filter.column]));
        }
      }
      
      // Apply ordering if specified
      if (this.orderBy) {
        filteredData.sort((a, b) => {
          if (a[this.orderBy!.column] < b[this.orderBy!.column]) {
            return this.orderBy!.ascending ? -1 : 1;
          }
          if (a[this.orderBy!.column] > b[this.orderBy!.column]) {
            return this.orderBy!.ascending ? 1 : -1;
          }
          return 0;
        });
      }
      
      return {
        data: filteredData,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching offline data for table ${this.table}:`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
  
  async maybeSingle(): Promise<OfflineResponse> {
    const result = await this._getFilteredData();
    
    if (result.error) {
      return {
        data: null,
        error: result.error
      };
    }
    
    return {
      data: result.data && result.data.length > 0 ? result.data[0] : null,
      error: null
    };
  }
  
  async single(): Promise<OfflineResponse> {
    const result = await this._getFilteredData();
    
    if (result.error) {
      return {
        data: null,
        error: result.error
      };
    }
    
    if (!result.data || result.data.length === 0) {
      return {
        data: null,
        error: new Error('No row found')
      };
    }
    
    if (result.data.length > 1) {
      return {
        data: null,
        error: new Error('More than one row found')
      };
    }
    
    return {
      data: result.data[0],
      error: null
    };
  }
}

class OfflineUpdateHandler {
  private table: string;
  private data: any;
  
  constructor(table: string, data: any) {
    this.table = table;
    this.data = data;
  }
  
  async eq(column: string, value: any): Promise<OfflineResponse> {
    // When back online, we'll need the ID for the update
    if (column === 'id') {
      this.data.id = value;
    }
    
    // Queue for sync when back online
    await saveForSync(this.table, 'update', this.data);
    
    return {
      data: [this.data],
      error: null
    };
  }
}

class OfflineDeleteHandler {
  private table: string;
  
  constructor(table: string) {
    this.table = table;
  }
  
  async eq(column: string, value: any): Promise<OfflineResponse> {
    // Only handle ID-based deletes
    if (column === 'id') {
      // Queue for sync when back online
      await saveForSync(this.table, 'delete', { id: value });
    }
    
    return {
      data: [],
      error: null
    };
  }
}

// Create a singleton instance
export const offlineSupabase = new OfflineSupabase();
