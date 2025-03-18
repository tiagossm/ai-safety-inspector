
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

// Parse Excel files
const parseExcel = (arrayBuffer: ArrayBuffer) => {
  try {
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });

    // Obtém a primeira aba do Excel
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Converte para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
  } catch (error) {
    console.error("❌ Erro ao processar arquivo Excel:", error);
    throw new Error("Falha ao processar arquivo Excel.");
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
        setSessionValid(!!data.session);
        console.log("✅ Sessão validada:", !!data.session);
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

  // Função auxiliar para renovar a sessão e obter um token JWT válido
  const getValidAuthToken = async (): Promise<string | null> => {
    try {
      console.log("🔄 Renovando a sessão para obter um token válido...");
      
      // Tenta renovar a sessão explicitamente
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("❌ Erro ao renovar sessão:", refreshError);
        throw new Error(`Erro ao renovar sessão: ${refreshError.message}`);
      }
      
      if (!refreshData.session) {
        console.error("❌ Nenhuma sessão após atualização");
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      const token = refreshData.session.access_token;
      
      console.log("✅ Token JWT renovado com sucesso. Comprimento:", token.length);
      console.log("🔒 Expiração:", new Date(refreshData.session.expires_at * 1000).toLocaleString());
      
      return token;
    } catch (error) {
      console.error("❌ Falha ao obter token de autenticação:", error);
      toast.error("Erro de autenticação. Tente fazer login novamente.");
      return null;
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

      // 🔑 Obter um token JWT válido usando nossa função auxiliar
      const jwt = await getValidAuthToken();
      
      if (!jwt) {
        console.error("❌ Não foi possível obter um token JWT válido");
        toast.error("Falha na autenticação. Faça login novamente.");
        return false;
      }

      // 🔍 **Verificando se o usuário está autenticado e tem um UUID válido**
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

      // ✅ Criando o checklist com user_id válido
      const checklistData = {
        ...form,
        status: form.status || "active", // 🔥 Garante um status válido
        status_checklist: form.status_checklist || "ativo",
        user_id: user.id, // 🔥 Garante que sempre haverá um ID de usuário válido
      };

      console.log("📝 Dados do checklist preparados para envio:", checklistData);

      // Criando FormData para envio do arquivo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("form", JSON.stringify(checklistData));

      console.log("📤 Enviando arquivo para processamento via Supabase Edge Function...");
      console.log("🔑 Usando token no cabeçalho Authorization: Bearer [token]");

      // Chamada para a Supabase Edge Function com o token renovado
      const { data, error } = await supabase.functions.invoke("process-checklist-csv", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${jwt}`,
          // Não definimos Content-Type aqui, pois o FormData já define um boundary correto
        },
        body: formData,
      });

      if (error) {
        console.error("❌ Erro na função Edge:", error);
        console.error("❌ Detalhes do erro:", error.message, error.name, error.stack);
        console.error("❌ Código de status:", error.context?.status);
        
        // Mensagem específica para erro 401
        if (error.context?.status === 401) {
          toast.error("Erro de autenticação. Sua sessão pode ter expirado. Faça login novamente.");
        } else {
          toast.error(`Erro na importação: ${error.message || "Falha desconhecida"}`);
        }
        return false;
      }

      console.log("✅ Resposta da função Edge:", data);

      if (data?.success) {
        toast.success(`Checklist importado com sucesso! ${data.processed_items || 0} itens processados.`);
        return data;
      } else {
        console.error("❌ Erro na importação:", data?.error || "Erro desconhecido");
        toast.error(data?.error || "Erro ao importar checklist");
        return false;
      }
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
