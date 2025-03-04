// Simple type for database operations that won't cause deep instantiation issues
export type SimpleDbOperation = {
  type: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  table: string;
  data?: any;
  filters?: Record<string, any>;
  options?: any;
};

// And in the problematic function replace the complex types with simpler ones
// For example, replace:
// type TableRow = Record<string, any>;
// type TableOperations<T extends TableRow> = {
//   insert: (data: T) => ...
//   select: () => ...
//   // etc
// }

// With something like:
export type TableMethods = {
  select: (columns?: string) => { eq: (column: string, value: any) => { single: () => Promise<any> } };
  insert: (data: any) => Promise<any>;
  update: (data: any) => { eq: (column: string, value: any) => Promise<any> };
  delete: () => { eq: (column: string, value: any) => Promise<any> };
};

// This way, instead of having deeply nested generic types that cause the compiler to bail out,
// we have concrete function signatures that provide the necessary typing without the complexity.

// The rest of the file would continue as normal, but with these simplified types
// in place of the problematic ones
