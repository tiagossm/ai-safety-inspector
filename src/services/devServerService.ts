/**
 * Serviço para comunicação com o Dev Server
 * Resolve problemas de CORS e fornece fallback para endpoints offline
 */

interface DevServerResponse {
  status: string;
  environment: string;
  timestamp: string;
  message: string;
  cors: string;
  version: string;
}

interface DevServerError {
  error: string;
  message: string;
  timestamp: string;
}

class DevServerService {
  private readonly baseUrl = 'https://jkgmgjjtslkozhehwmng.supabase.co/functions/v1/dev-server';
  private readonly sandboxUrl = '/_sandbox/dev-server';
  
  /**
   * Verifica se o dev-server está online
   */
  async checkStatus(): Promise<DevServerResponse | null> {
    try {
      console.log('Verificando status do dev-server...');
      
      // Primeiro tenta o endpoint do Supabase
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dev-server está online:', data);
        return data;
      }
      
      console.warn('Dev-server não está respondendo no endpoint principal');
      return null;
    } catch (error) {
      console.error('Erro ao verificar status do dev-server:', error);
      return null;
    }
  }

  /**
   * Tenta acessar o endpoint sandbox (local)
   */
  async checkSandboxEndpoint(): Promise<DevServerResponse | null> {
    try {
      console.log('Verificando endpoint sandbox...');
      
      const response = await fetch(this.sandboxUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Endpoint sandbox está funcionando:', data);
        return data;
      }
      
      console.warn('Endpoint sandbox não está respondendo');
      return null;
    } catch (error) {
      console.error('Erro ao acessar endpoint sandbox:', error);
      return null;
    }
  }

  /**
   * Inicializa o serviço e testa conectividade
   */
  async initialize(): Promise<boolean> {
    console.log('Inicializando DevServerService...');
    
    // Testa ambos os endpoints
    const [supabaseStatus, sandboxStatus] = await Promise.allSettled([
      this.checkStatus(),
      this.checkSandboxEndpoint()
    ]);

    const supabaseWorking = supabaseStatus.status === 'fulfilled' && supabaseStatus.value !== null;
    const sandboxWorking = sandboxStatus.status === 'fulfilled' && sandboxStatus.value !== null;

    if (supabaseWorking) {
      console.log('✅ Dev-server Supabase está funcionando');
    }
    
    if (sandboxWorking) {
      console.log('✅ Endpoint sandbox está funcionando');
    }

    if (!supabaseWorking && !sandboxWorking) {
      console.warn('⚠️ Nenhum endpoint dev-server está respondendo');
      return false;
    }

    return true;
  }

  /**
   * Configura headers CORS para requisições
   */
  getCorsHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true'
    };
  }
}

// Instância singleton
export const devServerService = new DevServerService();

// Auto-inicializa o serviço
devServerService.initialize().catch(error => {
  console.error('Falha ao inicializar DevServerService:', error);
});