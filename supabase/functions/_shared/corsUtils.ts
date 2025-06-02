// CORS headers para acesso cross-origin
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

// Função para lidar com requisições CORS preflight
export function handleCors(req: Request): Response | null {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  // Para outras requisições, retorna null para que o processamento normal continue
  return null;
}

// Função para adicionar cabeçalhos CORS a uma resposta existente
export function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  
  // Adicionar cabeçalhos CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  // Criar nova resposta com os mesmos dados, mas com cabeçalhos adicionados
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// Função para criar uma resposta de erro com cabeçalhos CORS
export function errorResponse(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message 
    }),
    { 
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}
