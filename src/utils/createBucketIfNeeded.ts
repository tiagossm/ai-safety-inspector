
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
      // Create the bucket if it doesn't exist
      console.log(`Bucket ${bucketName} does not exist, creating...`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        
        // Check if this is a permission error, which is common for client-side operations
        if (error.message.includes("permission") || error.message.includes("403")) {
          console.warn("Permission denied when creating bucket. This is normal for client-side operations. Contact your administrator to create the bucket.");
        }
        
        return false;
      }
      
      console.log(`Successfully created bucket ${bucketName}`);
      return true;
    }
  } catch (error) {
    console.error("Error in createBucketIfNeeded:", error);
    return false;
  }
}
