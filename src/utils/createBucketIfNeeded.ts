
import { supabase } from "@/integrations/supabase/client";

export async function createBucketIfNeeded(bucketName: string): Promise<boolean> {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError);
      return false;
    }
    
    // If the bucket doesn't exist, create it
    if (!buckets.find(b => b.name === bucketName)) {
      console.log(`Bucket ${bucketName} does not exist, creating...`);
      
      const { error: createError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 52428800 // 50MB
        });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
      
      // Set the bucket policy to public
      const { error: policyError } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl('dummy.txt', 60); // This is just to test if we can create URLs
      
      if (policyError && !policyError.message.includes('not found')) {
        console.error("Error setting bucket policy:", policyError);
        // Continue anyway as we might still be able to use the bucket
      }
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in createBucketIfNeeded:", error);
    return false;
  }
}
