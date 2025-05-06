
import { supabase } from "@/integrations/supabase/client";

/**
 * Create a storage bucket if it doesn't exist already
 * @param bucketId The ID of the bucket to create
 * @returns Promise<boolean> True if the bucket exists or was created successfully
 */
export async function createBucketIfNeeded(bucketId: string): Promise<boolean> {
  try {
    // First check if the bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error checking buckets:", listError);
      return false;
    }
    
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketId);
    
    // If the bucket already exists, return true
    if (bucketExists) {
      return true;
    }
    
    // Create the bucket if it doesn't exist
    const { data, error } = await supabase.storage.createBucket(bucketId, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
    });
    
    if (error) {
      console.error(`Error creating bucket ${bucketId}:`, error);
      return false;
    }
    
    console.log(`Bucket ${bucketId} created successfully`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating bucket ${bucketId}:`, error);
    return false;
  }
}
