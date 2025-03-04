
export type AllowedTableName = 'checklists' | 'users' | 'companies' | 'inspections';

export function isValidTable(tableName: string): tableName is AllowedTableName {
  const allowedTables: AllowedTableName[] = ['checklists', 'users', 'companies', 'inspections'];
  return allowedTables.includes(tableName as AllowedTableName);
}

export function getValidatedTable(tableName: string): AllowedTableName {
  if (isValidTable(tableName)) {
    return tableName;
  }
  throw new Error(`Invalid table name: ${tableName}`);
}
