
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a storage bucket if it doesn't already exist
 * @param bucketName The name of the bucket to create
 * @returns Promise<boolean> indicating if bucket exists or was created successfully
 */
export const createBucketIfNeeded = async (bucketName: string): Promise<boolean> => {
  try {
    // First check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }
    
    // Check if our bucket already exists
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket ${bucketName} already exists`);
      return true;
    }
    
    // Create the bucket if it doesn't exist
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true // Make the bucket public
    });
    
    if (createError) {
      console.error(`Error creating bucket ${bucketName}:`, createError);
      return false;
    }
    
    console.log(`Successfully created bucket ${bucketName}`);
    
    // The getPublicUrl method doesn't return an error property
    try {
      supabase.storage.from(bucketName).getPublicUrl('test');
      return true;
    } catch (policyError) {
      console.warn(`Bucket created but could not verify public access: ${policyError instanceof Error ? policyError.message : String(policyError)}`);
      return true; // Still return true as the bucket was created
    }
    
  } catch (error) {
    console.error("Unexpected error creating bucket:", error);
    return false;
  }
};
