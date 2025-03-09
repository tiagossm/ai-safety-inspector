
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Handles insert operations for the sync manager
 */
export async function handleInsert(client: SupabaseClient, table: string, record: any) {
  // Explicitly use select() to get back the data with ID
  const { data, error } = await client
    .from(table)
    .insert(record)
    .select();

  if (error) {
    console.error(`Error inserting record into ${table}:`, error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.error(`No data returned from ${table} insert operation`);
    throw new Error(`Failed to insert into ${table}: No data returned`);
  }

  // Check if the first item in data has an id
  const firstItem = data[0];
  if (!firstItem || !('id' in firstItem)) {
    console.error(`Created ${table} record is missing ID:`, firstItem);
    throw new Error(`Failed to insert into ${table}: ID not generated`);
  }

  console.log(`Successfully inserted record into ${table} with ID:`, firstItem.id);
  return firstItem;
}

/**
 * Handles update operations for the sync manager
 */
export async function handleUpdate(client: SupabaseClient, table: string, record: any) {
  if (!record.id) {
    console.error(`Cannot update ${table} record without ID:`, record);
    throw new Error(`Failed to update ${table}: Missing ID`);
  }

  const { data, error } = await client
    .from(table)
    .upsert(record)
    .select();

  if (error) {
    console.error(`Error updating record in ${table}:`, error);
    throw error;
  }

  console.log(`Successfully updated record in ${table} with ID:`, record.id);
  return data?.[0] || record;
}

/**
 * Handles delete operations for the sync manager
 */
export async function handleDelete(client: SupabaseClient, table: string, record: any) {
  if (!record.id) {
    console.error(`Cannot delete ${table} record without ID:`, record);
    throw new Error(`Failed to delete from ${table}: Missing ID`);
  }

  const { error } = await client
    .from(table)
    .delete()
    .match({ id: record.id });

  if (error) {
    console.error(`Error deleting record from ${table}:`, error);
    throw error;
  }

  console.log(`Successfully deleted record from ${table} with ID:`, record.id);
  return true;
}
