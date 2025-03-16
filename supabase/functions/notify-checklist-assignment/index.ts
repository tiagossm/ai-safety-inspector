
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { Resend } from "https://esm.sh/resend@1.0.0";

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
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');

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
    const { checklist_id, checklist_title, user_id } = await req.json();
    
    if (!checklist_id || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get user information
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('name, email')
      .eq('id', user_id)
      .single();
    
    if (userDataError || !userData) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get checklist information
    const { data: checklistData, error: checklistError } = await supabaseClient
      .from('checklists')
      .select('title, description, due_date')
      .eq('id', checklist_id)
      .single();
    
    if (checklistError || !checklistData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Checklist not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get assigner information
    const { data: assignerData, error: assignerError } = await supabaseClient
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();
    
    const assignerName = assignerError ? 'Um administrador' : assignerData.name;

    // Format due date
    const formattedDueDate = checklistData.due_date 
      ? new Date(checklistData.due_date).toLocaleDateString('pt-BR')
      : 'Não definido';

    // Send email notification
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'IASST <notificacoes@iasst.com.br>',
      to: [userData.email],
      subject: `Novo checklist atribuído: ${checklistData.title}`,
      html: `
        <h1>Olá, ${userData.name}!</h1>
        <p>${assignerName} atribuiu um novo checklist para você.</p>
        <h2>${checklistData.title}</h2>
        <p><strong>Descrição:</strong> ${checklistData.description || 'Sem descrição'}</p>
        <p><strong>Prazo:</strong> ${formattedDueDate}</p>
        <p>Acesse a plataforma para visualizar e preencher o checklist.</p>
        <a href="${Deno.env.get('APP_URL')}/checklists/${checklist_id}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px;">Ver Checklist</a>
        <p style="margin-top: 40px; color: #666;">Este é um email automático, por favor não responda.</p>
      `,
    });

    if (emailError) {
      console.error("Email sending error:", emailError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email notification' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
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
