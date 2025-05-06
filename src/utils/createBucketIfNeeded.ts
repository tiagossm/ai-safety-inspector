
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
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} does not exist, creating...`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 50000000, // 50 MB limit
        allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/*']
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in createBucketIfNeeded:", error);
    return false;
  }
}
