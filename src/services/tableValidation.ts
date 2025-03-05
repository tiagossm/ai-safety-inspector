
export type AllowedTableName = 'checklists' | 'users' | 'companies' | 'inspections' | 'checklist_itens' | 'checklist_permissions' | 'user_checklists' | 'user_companies';

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
