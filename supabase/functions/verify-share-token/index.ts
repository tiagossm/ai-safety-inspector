
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  inspectionId: string;
  token: string;
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
    const { inspectionId, token }: VerifyRequest = await req.json();

    // Validate the request
    if (!inspectionId || !token) {
      return new Response(
        JSON.stringify({
          error: "Missing inspectionId or token",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the share record
    const { data: shareData, error: shareError } = await supabaseClient
      .from("inspection_shares")
      .select("id, inspection_id, expires_at, permissions, status")
      .eq("inspection_id", inspectionId)
      .eq("share_token", token)
      .eq("status", "active")
      .single();

    if (shareError || !shareData) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Invalid or expired share token",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(shareData.expires_at);
    if (expiresAt < now) {
      // Update the token status to expired
      await supabaseClient
        .from("inspection_shares")
        .update({ status: "expired" })
        .eq("id", shareData.id);

      return new Response(
        JSON.stringify({
          valid: false,
          error: "Share token has expired",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log the access
    await supabaseClient
      .from("inspection_share_access_logs")
      .insert({
        share_id: shareData.id,
        access_time: now.toISOString(),
        client_ip: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      });

    // Get the inspection details 
    const { data: inspection, error: inspectionError } = await supabaseClient
      .from("inspections")
      .select("id, title, company_id, description, status")
      .eq("id", inspectionId)
      .single();

    if (inspectionError) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Failed to retrieve inspection details",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        permissions: shareData.permissions,
        inspection: {
          id: inspection.id,
          title: inspection.title,
          company_id: inspection.company_id,
          description: inspection.description,
          status: inspection.status,
        },
        expiresAt: shareData.expires_at,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error verifying share token:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: "Failed to verify share token",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
