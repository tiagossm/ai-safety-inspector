
// Define all valid table names that can be used in the application
export type AllowedTableName = 
  'checklists' | 
  'users' | 
  'companies' | 
  'inspections' | 
  'checklist_itens' | 
  'checklist_permissions' | 
  'user_checklists' | 
  'user_companies';

// List of tables that should exist as object stores in IndexedDB
const offlineStores = [
  'checklists', 
  'users', 
  'companies', 
  'inspections',
  'checklist_itens',
  'user_checklists',
  'checklist_permissions'
];

export function isValidTable(tableName: string): tableName is AllowedTableName {
  const allowedTables: AllowedTableName[] = [
    'checklists', 
    'users', 
    'companies', 
    'inspections', 
    'checklist_itens',
    'checklist_permissions',
    'user_checklists',
    'user_companies'
  ];
  return allowedTables.includes(tableName as AllowedTableName);
}

export function getValidatedTable(tableName: string): AllowedTableName {
  if (isValidTable(tableName)) {
    return tableName;
  }
  throw new Error(`Invalid table name: ${tableName}`);
}

// Check if a table should be available offline
export function isOfflineStore(tableName: string): boolean {
  return offlineStores.includes(tableName);
}
