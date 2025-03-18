
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import * as XLSX from "xlsx";

/**
 * Valida se o arquivo tem um formato correto (CSV, XLS, XLSX)
 */
const validateFileFormat = (file: File): { valid: boolean; message?: string } => {
  if (!file) return { valid: false, message: "Nenhum arquivo selecionado" };

  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!["csv", "xls", "xlsx"].includes(fileExtension || "")) {
    return {
      valid: false,
      message: "Formato de arquivo inválido. Apenas arquivos CSV, XLS e XLSX são suportados.",
    };
  }

  return { valid: true };
};

// Obtém um token de autenticação válido do Supabase
const getValidAuthToken = async (): Promise<string | null> => {
  try {
    console.log("🔄 Renovando a sessão para obter um token válido...");
    
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session) {
      console.log("❌ Sem sessão ativa, forçando refresh...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data?.session) {
        console.error("❌ Falha ao renovar sessão:", error?.message);
        toast.error("Erro de autenticação. Faça login novamente.");
        return null;
      }
      
      console.log("✅ Token JWT renovado com sucesso após refresh.");
      return data.session.access_token;
    }
    
    // If session exists but might be close to expiry, refresh it anyway
    if (sessionData.session) {
      const expiresAt = sessionData.session.expires_at;
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt ? expiresAt - currentTime : 0;
      
      // If less than 5 minutes until expiry, refresh the token
      if (timeUntilExpiry < 300) {
        console.log("🔄 Token próximo da expiração, renovando...");
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData?.session) {
          console.error("❌ Falha ao renovar sessão próxima da expiração:", refreshError?.message);
          // Still return the current token as it's valid
          return sessionData.session.access_token;
        }
        
        console.log("✅ Token JWT renovado com sucesso.");
        return refreshData.session.access_token;
      }
      
      console.log("✅ Usando token JWT existente (válido).");
      console.log("🔑 Token JWT obtido. Comprimento:", sessionData.session.access_token.length);
      return sessionData.session.access_token;
    }
    
    console.error("❌ Situação inesperada na verificação do token.");
    return null;
  } catch (error) {
    console.error("❌ Erro crítico ao obter token JWT:", error);
    toast.error("Erro de autenticação. Faça login novamente.");
    return null;
  }
};

export function useChecklistImport() {
  const createChecklist = useCreateChecklist();
  const { user, refreshSession } = useAuth();
  const [sessionValid, setSessionValid] = useState(false);

  // Verifica se a sessão é válida ao montar o componente
  useEffect(() => {
    const validateSession = async () => {
      try {
        await refreshSession();
        const { data } = await supabase.auth.getSession();
        const isValid = !!data.session;
        setSessionValid(isValid);
        console.log("✅ Sessão validada:", isValid);
        
        if (!isValid) {
          console.warn("⚠️ Sessão inválida em useChecklistImport");
          toast.error("Sessão expirada", {
            description: "Sua sessão expirou. Faça login novamente."
          });
        }
      } catch (error) {
        console.error("❌ Erro na validação da sessão:", error);
        setSessionValid(false);
      }
    };

    validateSession();
  }, [refreshSession]);

  const getTemplateFileUrl = () => {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/templates/checklist_import_template.xlsx`;
  };

  const parseFile = async (file: File) => {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        // Parse CSV
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (!e.target?.result) {
              reject(new Error('Failed to read file'));
              return;
            }
            
            // Parse CSV content
            const content = e.target.result as string;
            const rows = content.split('\n');
            const headers = rows[0].split(',').map(h => h.trim());
            
            const questions = [];
            for (let i = 1; i < rows.length; i++) {
              if (!rows[i].trim()) continue;
              
              const values = rows[i].split(',').map(v => v.trim());
              const question = {
                text: values[0] || '',
                type: values[1] || 'sim/não',
                required: values[2]?.toLowerCase() === 'sim' || values[2]?.toLowerCase() === 'true',
                allowPhoto: values[3]?.toLowerCase() === 'sim' || values[3]?.toLowerCase() === 'true',
                allowVideo: values[4]?.toLowerCase() === 'sim' || values[4]?.toLowerCase() === 'true',
                allowAudio: values[5]?.toLowerCase() === 'sim' || values[5]?.toLowerCase() === 'true',
              };
              
              if (question.text) {
                questions.push(question);
              }
            }
            
            resolve({ questions });
          };
          
          reader.onerror = (error) => {
            reject(error);
          };
          
          reader.readAsText(file);
        });
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        // Parse Excel
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (!e.target?.result) {
              reject(new Error('Failed to read file'));
              return;
            }
            
            try {
              const data = new Uint8Array(e.target.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const rows = XLSX.utils.sheet_to_json(firstSheet);
              
              const questions = rows.map((row: any) => ({
                text: row.Pergunta || row.Question || row.pergunta || row.question || '',
                type: row.Tipo || row.Type || row.tipo || row.type || 'sim/não',
                required: row.Obrigatório === 'Sim' || row.Required === 'Yes' || row.Obrigatório === true || row.Required === true,
                allowPhoto: row.PermiteFoto === 'Sim' || row.AllowPhoto === 'Yes' || row.PermiteFoto === true || row.AllowPhoto === true,
                allowVideo: row.PermiteVideo === 'Sim' || row.AllowVideo === 'Yes' || row.PermiteVideo === true || row.AllowVideo === true,
                allowAudio: row.PermiteAudio === 'Sim' || row.AllowAudio === 'Yes' || row.PermiteAudio === true || row.AllowAudio === true,
              })).filter((q: any) => q.text);
              
              resolve({ questions });
            } catch (error) {
              reject(error);
            }
          };
          
          reader.onerror = (error) => {
            reject(error);
          };
          
          reader.readAsArrayBuffer(file);
        });
      }
      
      throw new Error('Unsupported file format');
    } catch (error) {
      console.error("Error parsing file:", error);
      throw error;
    }
  };

  const importFromFile = async (file: File, form: NewChecklist) => {
    // Validação inicial do arquivo
    if (!file) {
      toast.error("Nenhum arquivo selecionado");
      return false;
    }

    const validation = validateFileFormat(file);
    if (!validation.valid) {
      toast.error(validation.message || "Arquivo inválido");
      return false;
    }

    try {
      console.log("📂 Importando checklist do arquivo:", file.name, "| Tamanho:", Math.round(file.size / 1024), "KB");

      // 🔑 Obtém um token JWT válido
      const jwt = await getValidAuthToken();
      if (!jwt) {
        console.error("❌ Falha ao obter token JWT");
        toast.error("Erro de autenticação", { 
          description: "Não foi possível obter um token de autenticação. Tente fazer login novamente." 
        });
        return false;
      }

      // 🔍 Verificando se o usuário está autenticado e tem um UUID válido
      if (!user?.id || !/^[0-9a-fA-F-]{36}$/.test(user.id)) {
        console.error("🚨 Erro: Usuário não autenticado ou ID inválido!");
        toast.error("Erro: Usuário não autenticado. Faça login novamente.");
        return false;
      }

      console.log("👤 Usuário autenticado:", {
        user_id: user.id,
        email: user.email || "NÃO ENCONTRADO",
        autenticado: !!user,
      });

      // Sanitize company_id if it's in an invalid format
      let sanitizedCompanyId = null;
      
      if (form.company_id !== undefined && form.company_id !== null) {
        if (typeof form.company_id === 'object') {
          console.warn("⚠️ company_id está em formato de objeto:", form.company_id);
          
          // Check if it has a value property that's a string and not 'undefined'
          const companyObj = form.company_id as any;
          if ('value' in companyObj && 
              typeof companyObj.value === 'string' && 
              companyObj.value !== 'undefined') {
            sanitizedCompanyId = companyObj.value;
          }
        } else if (typeof form.company_id === 'string' && form.company_id !== 'undefined') {
          sanitizedCompanyId = form.company_id;
        }
      }

      // Parse the file to get the questions
      const parsedData = await parseFile(file);
      
      // Create a temporary checklist data object
      const checklistData = {
        ...form,
        company_id: sanitizedCompanyId,
        status: form.status || "active",
        status_checklist: form.status_checklist || "ativo",
        user_id: user.id,
        title: form.title || `Checklist importado: ${file.name}`,
        description: form.description || `Checklist importado do arquivo ${file.name}`
      };
      
      toast.success("Arquivo importado com sucesso! Revise o checklist antes de salvar.");
      
      return {
        success: true,
        checklistData,
        questions: parsedData.questions,
        mode: "import-review"
      };
    } catch (error: any) {
      console.error("❌ Erro geral ao importar checklist:", error);
      toast.error(`Erro ao importar checklist: ${error.message}`);
      return false;
    }
  };

  return {
    importFromFile,
    getTemplateFileUrl,
    sessionValid,
  };
}
