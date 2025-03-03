
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Get the params from the request
    const { checklist_id } = await req.json();

    if (!checklist_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Checklist ID is required" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Get the user's role
    const { data: userData, error: roleError } = await supabaseClient
      .from('users')
      .select('role, tier')
      .eq('id', user.id)
      .single();

    if (roleError) {
      return new Response(
        JSON.stringify({ success: false, error: "Error fetching user role" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const isAdmin = userData.role === 'admin' || userData.tier === 'super_admin';

    // If the user is an admin, they have full access
    if (isAdmin) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          permissions: {
            read: true,
            write: true,
            delete: true
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is the responsible for the checklist
    const { data: checklistData, error: checklistError } = await supabaseClient
      .from('checklists')
      .select('responsible_id, company_id')
      .eq('id', checklist_id)
      .single();

    if (checklistError) {
      return new Response(
        JSON.stringify({ success: false, error: "Error fetching checklist" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const isResponsible = checklistData.responsible_id === user.id;

    // Check if the user belongs to the company
    const { data: userCompanyData, error: userCompanyError } = await supabaseClient
      .from('user_companies')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', checklistData.company_id);

    if (userCompanyError) {
      return new Response(
        JSON.stringify({ success: false, error: "Error checking user company" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const isFromCompany = userCompanyData && userCompanyData.length > 0;

    // Define permissions based on the user's relationship to the checklist
    const permissions = {
      read: true, // All authenticated users with access to the company can read
      write: isAdmin || isResponsible || (isFromCompany && userData.role === 'Gerente'),
      delete: isAdmin || (isResponsible && userData.role === 'Gerente')
    };

    return new Response(
      JSON.stringify({ success: true, permissions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
