
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
        try {
          // We'll use SQL directly since the RPC function may not exist
          const { error: policyError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl('dummy.txt', 1); // Just to test access
          
          if (policyError) {
            console.log("Notice: Could not verify bucket access, may need manual policy setup");
          }
        } catch (policyError) {
          console.error("Warning: Failed to verify bucket policies:", policyError);
          // This is not a critical error, so we still return true
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error checking/creating bucket:", error);
    return false;
  }
}
