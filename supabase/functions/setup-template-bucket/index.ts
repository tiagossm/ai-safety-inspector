
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create a storage bucket for templates if it doesn't exist
    const { data: buckets, error: getBucketsError } = await supabase
      .storage
      .listBuckets()

    if (getBucketsError) {
      throw getBucketsError
    }

    // Check if templates bucket exists
    const templatesBucket = buckets.find(bucket => bucket.name === 'templates')
    
    if (!templatesBucket) {
      // Create templates bucket
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('templates', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
          ]
        })

      if (createBucketError) {
        throw createBucketError
      }
      
      console.log('Templates bucket created successfully')
    } else {
      console.log('Templates bucket already exists')
    }

    // Create a storage bucket for checklist media if it doesn't exist
    const checklistMediaBucket = buckets.find(bucket => bucket.name === 'checklist-media')
    
    if (!checklistMediaBucket) {
      // Create checklist-media bucket
      const { error: createMediaBucketError } = await supabase
        .storage
        .createBucket('checklist-media', {
          public: true,
          fileSizeLimit: 104857600, // 100MB
          allowedMimeTypes: [
            'image/*',
            'video/*',
            'audio/*',
            'application/pdf'
          ]
        })

      if (createMediaBucketError) {
        throw createMediaBucketError
      }
      
      console.log('Checklist media bucket created successfully')
    } else {
      console.log('Checklist media bucket already exists')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Storage buckets verified and created if needed'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
