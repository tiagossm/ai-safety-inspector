
// Simple type for database operations that won't cause deep instantiation issues
export type SimpleDbOperation = {
  type: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  table: string;
  data?: any;
  filters?: Record<string, any>;
  options?: any;
};

// Simplified types to avoid recursive complexity
export type TableMethods = {
  select: (columns?: string) => { 
    eq: (column: string, value: any) => { 
      single: () => Promise<any>;
      maybeSingle: () => Promise<any>;
    } 
  };
  insert: (data: any) => Promise<any>;
  update: (data: any) => { eq: (column: string, value: any) => Promise<any> };
  delete: () => { eq: (column: string, value: any) => Promise<any> };
};

// Mock Supabase-like interface for offline use
export const offlineSupabase = {
  from: (tableName: string): TableMethods => {
    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            console.log(`[OFFLINE] Fetching single ${tableName} where ${column} = ${value}`);
            return { data: null, error: null };
          },
          maybeSingle: async () => {
            console.log(`[OFFLINE] Maybe fetching single ${tableName} where ${column} = ${value}`);
            return { data: null, error: null };
          }
        })
      }),
      insert: async (data: any) => {
        console.log(`[OFFLINE] Inserting into ${tableName}:`, data);
        return { data: { ...data, id: 'offline-id' }, error: null };
      },
      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          console.log(`[OFFLINE] Updating ${tableName} where ${column} = ${value}:`, data);
          return { data: null, error: null };
        }
      }),
      delete: () => ({
        eq: async (column: string, value: any) => {
          console.log(`[OFFLINE] Deleting from ${tableName} where ${column} = ${value}`);
          return { data: null, error: null };
        }
      })
    };
  },
  auth: {
    getSession: async () => {
      console.log('[OFFLINE] Getting session');
      return { data: null, error: null };
    },
    getUser: async () => {
      console.log('[OFFLINE] Getting user');
      return { data: { user: null }, error: null };
    },
    signOut: async () => {
      console.log('[OFFLINE] Signing out');
      return { error: null };
    },
    onAuthStateChange: () => {
      console.log('[OFFLINE] Setting up auth state change listener');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};
