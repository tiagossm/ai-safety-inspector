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
    const refreshSuccessful = await supabase.auth.refreshSession();
    
    if (!refreshSuccessful.data?.session) {
      console.error("❌ Falha ao renovar sessão. Tentando novamente...");
      const { data: newSession, error } = await supabase.auth.getSession();

      if (error || !newSession?.session) {
        console.error("❌ Falha ao recuperar a sessão ativa:", error?.message);
        toast.error("Erro de autenticação. Faça login novamente.");
        return null;
      }
      
      console.log("✅ Nova sessão ativa encontrada.");
      return newSession.session.access_token;
    }

    console.log("✅ Token JWT renovado com sucesso.");
    return refreshSuccessful.data.session.access_token;
  } catch (error) {
    console.error("❌ Erro ao obter token JWT:", error);
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

      // ✅ Criando o checklist com user_id válido
      const checklistData = {
        ...form,
        status: form.status || "active",
        status_checklist: form.status_checklist || "ativo",
        user_id: user.id,
      };

      console.log("📝 Dados do checklist preparados para envio:", checklistData);

      // Criando FormData para envio do arquivo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("form", JSON.stringify(checklistData));

      console.log("📤 Enviando arquivo para processamento via Supabase Edge Function...");

      // Chamada para a Supabase Edge Function com o token renovado
      const { data, error } = await supabase.functions.invoke("process-checklist-csv", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
      });

      if (error) {
        console.error("❌ Erro na função Edge:", error);
        console.error("❌ Código de status:", error.context?.status);

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
