import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist"; 
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import * as XLSX from 'xlsx';

/**
 * Valida se o arquivo tem um formato correto (CSV, XLS, XLSX)
 */
const validateFileFormat = (file: File): { valid: boolean; message?: string } => {
  if (!file) return { valid: false, message: 'Nenhum arquivo selecionado' };

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!['csv', 'xls', 'xlsx'].includes(fileExtension || '')) {
    return { 
      valid: false, 
      message: 'Formato de arquivo inválido. Apenas arquivos CSV, XLS e XLSX são suportados.' 
    };
  }
  
  return { valid: true };
};

// Parse Excel files
const parseExcel = (arrayBuffer: ArrayBuffer) => {
  try {
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });

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

      // Atualiza a sessão antes de continuar
      await refreshSession();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error("❌ Erro na autenticação:", sessionError || "Nenhuma sessão ativa");
        toast.error("Sessão inválida. Faça login novamente.");
        return false;
      }

      const jwt = sessionData.session.access_token;
      console.log("🔑 Token JWT obtido. Comprimento:", jwt.length);

      // 📌 Verificando se o usuário autenticado tem um `user_id` válido
      console.log("🔍 Verificando usuário antes da criação do checklist:", {
        user_id: user?.id || "NÃO ENCONTRADO",
        email: user?.email || "NÃO ENCONTRADO",
        autenticado: !!user
      });

      // 🚨 Impede o envio de user_id inválido
      if (!user?.id || user.id === "00000000-0000-0000-0000-000000000000") {
        console.error("🚨 Erro: Usuário não autenticado ou ID inválido!");
        toast.error("Erro: Usuário não autenticado. Faça login novamente.");
        return false;
      }

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
      formData.append('file', file);
      formData.append('form', JSON.stringify(checklistData));

      console.log("📤 Enviando requisição para Edge Function com JWT:", jwt);

      // Chamada para a Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('process-checklist-csv', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${jwt}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY // ✅ Garante que a API Key seja enviada
        },
        body: formData
      });

      if (error) {
        console.error("❌ Erro na função Edge:", error);
        toast.error(`Erro na importação: ${error.message || 'Falha desconhecida'}`);
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
    sessionValid
  };
}
