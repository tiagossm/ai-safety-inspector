
import { supabase } from "@/integrations/supabase/client";

export async function createBucketIfNeeded(bucketName: string, isPublic: boolean = true): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
        return false;
      }
      
      console.log(`Created bucket: ${bucketName}`);
      
      // Set up RLS policy for public access if needed
      if (isPublic) {
        const { error: policyError } = await supabase
          .rpc('create_storage_policy', { 
            bucket_name: bucketName,
            policy_name: `${bucketName}_public_policy`,
            definition: `storage.bucket_id() = '${bucketName}'`
          });
        
        if (policyError) {
          console.error("Error creating bucket policy:", policyError);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error checking/creating bucket:", error);
    return false;
  }
}
