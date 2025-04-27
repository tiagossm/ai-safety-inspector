
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ShareRequest {
  inspectionId: string;
  expirationDays?: number;
  permissions?: string[];
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

    // Get the request body and auth user
    const { inspectionId, expirationDays = 7, permissions = ["read"] }: ShareRequest = await req.json();
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");

    // Validate the request
    if (!inspectionId) {
      return new Response(
        JSON.stringify({
          error: "Missing inspectionId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the inspection exists
    const { data: inspection, error: inspectionError } = await supabaseClient
      .from("inspections")
      .select("id, title")
      .eq("id", inspectionId)
      .single();

    if (inspectionError || !inspection) {
      return new Response(
        JSON.stringify({
          error: "Inspection not found",
          details: inspectionError?.message,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the authenticated user (if available)
    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser(authHeader);
      userId = user?.id;
    }

    // Generate a secure token
    const tokenBytes = new Uint8Array(32); // 256 bits
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Create a share record
    const { data: shareData, error: shareError } = await supabaseClient
      .from("inspection_shares")
      .insert({
        inspection_id: inspectionId,
        share_token: token,
        created_by: userId,
        expires_at: expiresAt.toISOString(),
        permissions: permissions,
        status: "active"
      })
      .select("id")
      .single();

    if (shareError) {
      throw new Error(`Failed to create share record: ${shareError.message}`);
    }

    // Generate share URL
    const baseUrl = Deno.env.get("FRONTEND_URL") || "";
    const shareUrl = `${baseUrl}/share/${inspectionId}?token=${token}`;

    return new Response(
      JSON.stringify({
        shareUrl,
        shareId: shareData.id,
        token,
        expiresAt: expiresAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating share token:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate share token",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
