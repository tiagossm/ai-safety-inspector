
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the current authenticated user
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get request body
    const { checklist_id, user_ids, company_id } = await req.json();
    
    if (!checklist_id || !user_ids || !Array.isArray(user_ids)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the user's role and company
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('role, tier, company_id')
      .eq('id', user.id)
      .single();
      
    if (userDataError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check permissions based on role
    const isSuperAdmin = userData.tier === 'super_admin';
    const isCompanyAdmin = userData.tier === 'company_admin' || userData.role === 'Administrador';
    
    // Get the checklist info
    const { data: checklistData, error: checklistError } = await supabaseClient
      .from('checklists')
      .select('company_id')
      .eq('id', checklist_id)
      .single();
      
    if (checklistError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Checklist not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const canAssign = 
      isSuperAdmin || 
      (isCompanyAdmin && checklistData.company_id === userData.company_id);
      
    if (!canAssign) {
      return new Response(
        JSON.stringify({ success: false, error: 'You do not have permission to assign this checklist' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Verify all users belong to the same company (for company admins)
    if (isCompanyAdmin && !isSuperAdmin) {
      const { data: assignedUsers, error: assignedUsersError } = await supabaseClient
        .from('users')
        .select('id, company_id')
        .in('id', user_ids);
        
      if (assignedUsersError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to verify user companies' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      const invalidUsers = assignedUsers.filter(u => u.company_id !== userData.company_id);
      if (invalidUsers.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'You can only assign checklists to users in your company',
            invalidUserIds: invalidUsers.map(u => u.id)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    }
    
    // All checks passed, create the assignments
    const assignments = user_ids.map(userId => ({
      checklist_id,
      user_id: userId,
      company_id: company_id || checklistData.company_id || userData.company_id
    }));
    
    // Delete existing assignments first
    await supabaseClient
      .from('user_checklists')
      .delete()
      .eq('checklist_id', checklist_id)
      .in('user_id', user_ids);
      
    // Insert new assignments
    const { error: insertError } = await supabaseClient
      .from('user_checklists')
      .insert(assignments);
      
    if (insertError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create assignments', details: insertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Checklist assigned to ${user_ids.length} users`,
        data: { assignedUserIds: user_ids }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', details: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
