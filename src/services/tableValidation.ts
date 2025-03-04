
// List of allowed table names for type safety
const ALLOWED_TABLES = [
  "companies",
  "users",
  "checklists",
  "checklist_itens",
  "inspections",
  "inspection_responses",
  "units",
  "platform",
  "automated_incidents",
  "checklist_assignments"
] as const;

export type AllowedTableName = typeof ALLOWED_TABLES[number];

// Helper to check if a table name is valid
export function isValidTable(tableName: string): tableName is AllowedTableName {
  return ALLOWED_TABLES.includes(tableName as AllowedTableName);
}

// Get a type-safe table name or throw an error
export function getValidatedTable(tableName: string): AllowedTableName {
  if (!isValidTable(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }
  return tableName;
}
