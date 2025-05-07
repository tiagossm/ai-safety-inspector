
import { supabase } from "@/integrations/supabase/client";

export async function createBucketIfNeeded(bucketName: string): Promise<boolean> {
  try {
    // First check if the bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error checking buckets:", listError);
      return false;
    }
    
    const bucketExists = existingBuckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket ${bucketName} already exists`);
      return true;
    } else {
      // Bucket does not exist - in this case, we shouldn't try to create it
      // via the client SDK as it may not have enough permissions.
      // Instead, just log the situation - buckets should be created via migrations
      console.log(`Bucket ${bucketName} does not exist. Please contact the administrator to create it.`);
      return false;
    }
  } catch (error) {
    console.error("Error in createBucketIfNeeded:", error);
    return false;
  }
}
