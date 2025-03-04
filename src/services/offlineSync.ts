
// This file re-exports all offline sync functionality from the modular files
import { initOfflineDb, saveForSync, getOfflineData, initOfflineSystem } from './offlineDb';
import { syncWithServer } from './syncManager';
import { offlineSupabase } from './offlineSupabase';
import { isValidTable, getValidatedTable, type AllowedTableName } from './tableValidation';

// Re-export everything
export {
  initOfflineDb,
  saveForSync,
  getOfflineData,
  initOfflineSystem,
  syncWithServer,
  offlineSupabase,
  isValidTable,
  getValidatedTable,
  type AllowedTableName
};
