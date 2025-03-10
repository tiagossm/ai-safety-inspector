
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

    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // SQL to create RLS policies for checklists
    const createPoliciesSQL = `
    -- First, enable RLS on checklists table if not already enabled
    ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist (to avoid conflicts)
    DROP POLICY IF EXISTS "Super Admins can do everything" ON checklists;
    DROP POLICY IF EXISTS "Users can view their own company checklists" ON checklists;
    DROP POLICY IF EXISTS "Users can insert their own checklists" ON checklists;
    DROP POLICY IF EXISTS "Users can update their own checklists" ON checklists;
    DROP POLICY IF EXISTS "Users can delete their own checklists" ON checklists;

    -- Create policy for super admins to have full access
    CREATE POLICY "Super Admins can do everything" 
    ON checklists 
    USING (
      (SELECT tier FROM users WHERE users.id = auth.uid()) = 'super_admin'
    );

    -- Create policy for users to view checklists they own or from their company
    CREATE POLICY "Users can view their own company checklists" 
    ON checklists 
    FOR SELECT 
    USING (
      auth.uid() = user_id OR 
      company_id = (SELECT company_id FROM users WHERE users.id = auth.uid())
    );

    -- Create policy for users to insert their own checklists
    CREATE POLICY "Users can insert their own checklists" 
    ON checklists 
    FOR INSERT 
    WITH CHECK (
      auth.uid() = user_id
    );

    -- Create policy for users to update their own checklists
    CREATE POLICY "Users can update their own checklists" 
    ON checklists 
    FOR UPDATE 
    USING (
      auth.uid() = user_id
    );

    -- Create policy for users to delete their own checklists
    CREATE POLICY "Users can delete their own checklists" 
    ON checklists 
    FOR DELETE 
    USING (
      auth.uid() = user_id
    );

    -- Also set up RLS policies for checklist items
    ALTER TABLE checklist_itens ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Super Admins can do everything with items" ON checklist_itens;
    DROP POLICY IF EXISTS "Users can view items from their checklists" ON checklist_itens;
    DROP POLICY IF EXISTS "Users can insert items to their checklists" ON checklist_itens;
    DROP POLICY IF EXISTS "Users can update items in their checklists" ON checklist_itens;
    DROP POLICY IF EXISTS "Users can delete items from their checklists" ON checklist_itens;

    -- Create policy for super admins to have full access to items
    CREATE POLICY "Super Admins can do everything with items" 
    ON checklist_itens 
    USING (
      (SELECT tier FROM users WHERE users.id = auth.uid()) = 'super_admin'
    );

    -- Create policy for users to view checklist items they own
    CREATE POLICY "Users can view items from their checklists" 
    ON checklist_itens 
    FOR SELECT 
    USING (
      checklist_id IN (
        SELECT id FROM checklists WHERE 
        user_id = auth.uid() OR 
        company_id = (SELECT company_id FROM users WHERE users.id = auth.uid())
      )
    );

    -- Create policy for users to insert items to their checklists
    CREATE POLICY "Users can insert items to their checklists" 
    ON checklist_itens 
    FOR INSERT 
    WITH CHECK (
      checklist_id IN (
        SELECT id FROM checklists WHERE user_id = auth.uid()
      )
    );

    -- Create policy for users to update items in their checklists
    CREATE POLICY "Users can update items in their checklists" 
    ON checklist_itens 
    FOR UPDATE 
    USING (
      checklist_id IN (
        SELECT id FROM checklists WHERE user_id = auth.uid()
      )
    );

    -- Create policy for users to delete items from their checklists
    CREATE POLICY "Users can delete items from their checklists" 
    ON checklist_itens 
    FOR DELETE 
    USING (
      checklist_id IN (
        SELECT id FROM checklists WHERE user_id = auth.uid()
      )
    );
    `;

    // Execute the SQL to create policies
    const { error } = await supabase.rpc('pg_exec', { sql: createPoliciesSQL });

    if (error) {
      throw new Error(`Failed to create RLS policies: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'RLS policies for checklists created successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error creating RLS policies:', error);
    
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
    );
  }
});
