
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Responsible {
  id: string;
  name: string;
  email: string;
}

interface InspectionData {
  company: string;
  scheduledDate?: Date | null;
  location: string;
  inspectionType: string;
}

interface RequestBody {
  inspectionId: string;
  responsibles: Responsible[];
  inspectionData: InspectionData;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get the request body
    const body: RequestBody = await req.json();
    const { inspectionId, responsibles, inspectionData } = body;

    if (!inspectionId || !responsibles || !responsibles.length) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get company name
    const { data: company } = await supabaseClient
      .from("companies")
      .select("fantasy_name")
      .eq("id", inspectionData.company)
      .single();

    const companyName = company?.fantasy_name || "N/A";

    // Inspection URL for the notification
    const inspectionUrl = `${Deno.env.get("FRONTEND_URL") || ""}/inspections/${inspectionId}`;

    // Format scheduled date if exists
    const scheduledDate = inspectionData.scheduledDate 
      ? new Date(inspectionData.scheduledDate).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : "Não agendada";

    // Send email to each responsible
    for (const responsible of responsibles) {
      try {
        // Here we would integrate with an email service like Resend, SendGrid, etc.
        // For now, let's log the email we would send
        console.log(`Sending notification email to ${responsible.email}:`);
        console.log(`Subject: Nova Inspeção: ${inspectionData.inspectionType} - ${companyName}`);
        console.log(`
          Olá ${responsible.name},

          Você foi designado como responsável para uma inspeção:
          
          Tipo: ${inspectionData.inspectionType}
          Empresa: ${companyName}
          Local: ${inspectionData.location}
          Data/Hora: ${scheduledDate}
          
          Acesse a inspeção em: ${inspectionUrl}
          
          Este é um email automático, não responda.
        `);

        // TODO: Implement actual email sending when email provider is set up
        // await sendEmail(responsible.email, ...);
      } catch (emailError) {
        console.error(`Failed to send email to ${responsible.email}:`, emailError);
      }
    }

    // If scheduledDate exists, schedule a reminder 1 hour before
    if (inspectionData.scheduledDate) {
      const reminderTime = new Date(inspectionData.scheduledDate);
      reminderTime.setHours(reminderTime.getHours() - 1);

      console.log(`Reminder scheduled for ${reminderTime.toISOString()}`);
      // TODO: Implement actual reminder scheduling when needed
      // This would typically be done using a cron job or a scheduled task
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification sent to ${responsibles.length} responsibles`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing notification request:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process notification",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
