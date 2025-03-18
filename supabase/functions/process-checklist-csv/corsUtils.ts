
// CORS headers to allow requests from any origin
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle CORS preflight requests
export function handleCors(req: Request): Response | null {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  // For other requests, continue processing
  return null;
}
