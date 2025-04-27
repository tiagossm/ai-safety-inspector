
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResponsibleUser {
  id: string;
  name: string;
  email: string;
}

interface InspectionData {
  id: string;
  title: string;
  company_name: string;
  scheduled_date: string | null;
  location: string;
  inspection_type: string;
  priority: string;
}

interface EmailRequest {
  responsibles: ResponsibleUser[];
  inspection: InspectionData;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const requestData: EmailRequest = await req.json();
    const { responsibles, inspection } = requestData;

    if (!responsibles || responsibles.length === 0 || !inspection) {
      return new Response(
        JSON.stringify({
          error: "Dados incompletos",
          details: "Responsáveis e dados da inspeção são obrigatórios",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Form the inspection URL
    const baseUrl = Deno.env.get("FRONTEND_URL") || "";
    const inspectionUrl = `${baseUrl}/inspections/${inspection.id}/view`;

    // Format date if available
    const formattedDate = inspection.scheduled_date
      ? new Date(inspection.scheduled_date).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Não agendada";

    // Prepare the email content
    const emailSubject = `Nova Inspeção Atribuída: ${inspection.title}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Nova Inspeção Atribuída</h2>
        
        <p>Você foi designado como responsável para a seguinte inspeção:</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Título:</strong> ${inspection.title}</p>
          <p><strong>Empresa:</strong> ${inspection.company_name}</p>
          <p><strong>Tipo:</strong> ${inspection.inspection_type}</p>
          <p><strong>Prioridade:</strong> ${inspection.priority}</p>
          <p><strong>Local:</strong> ${inspection.location}</p>
          <p><strong>Data/Hora:</strong> ${formattedDate}</p>
        </div>
        
        <p>Para acessar a inspeção, <a href="${inspectionUrl}" style="color: #0066cc;">clique aqui</a>.</p>
        
        <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
          Este é um e-mail automático. Por favor, não responda diretamente.
        </p>
      </div>
    `;

    // Send email to each responsible
    const emailResults = [];
    for (const responsible of responsibles) {
      try {
        // Here we would connect to an email service like Resend, SendGrid, etc.
        // For now, we'll log what would be sent
        console.log(`Sending email to ${responsible.email}:`);
        console.log(`Subject: ${emailSubject}`);
        console.log(`Content: Email notification about inspection ${inspection.id}`);
        
        // Track in audit logs
        const { data: logData, error: logError } = await supabaseClient
          .from("notification_logs")
          .insert({
            recipient_id: responsible.id,
            recipient_email: responsible.email,
            notification_type: "inspection_assignment",
            subject: emailSubject,
            related_resource: inspection.id,
            status: "simulated", // In a real implementation this would be "sent" or "failed"
          });
          
        if (logError) {
          console.error("Error logging notification:", logError);
        }

        emailResults.push({
          recipient: responsible.email,
          status: "simulated", // Would be "sent" in production
          message: "Email notification simulated successfully",
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${responsible.email}:`, emailError);
        emailResults.push({
          recipient: responsible.email,
          status: "error",
          error: emailError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: emailResults,
        message: `Notification processed for ${responsibles.length} responsibles`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notify-inspection-responsible:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao processar notificação",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
