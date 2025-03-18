
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

/**
 * Lê um arquivo CSV e converte para JSON
 */
const parseCSV = async (file: File) => {
  try {
    const text = await file.text();
    const workbook = XLSX.read(text, { type: "string" });
    const sheetName = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } catch (error) {
    console.error("❌ Erro ao processar arquivo CSV:", error);
    throw new Error("Falha ao processar arquivo CSV.");
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
    if (!file) {
      toast.error("Nenhum arquivo selecionado.");
      return false;
    }

    const validation = validateFileFormat(file);
    if (!validation.valid) {
      toast.error(validation.message || "Arquivo inválido.");
      return false;
    }

    try {
      console.log("📂 Lendo arquivo CSV antes do envio...");
      const csvData = await parseCSV(file);
      console.log("📌 Conteúdo do CSV:", csvData);

      if (!csvData || csvData.length === 0) {
        toast.error("O arquivo CSV está vazio ou inválido.");
        return false;
      }

      await refreshSession();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        toast.error("Sessão inválida. Faça login novamente.");
        return false;
      }

      const jwt = sessionData.session.access_token;

      // ✅ Criando checklist com perguntas associadas
      const checklistData = {
        ...form,
        status: form.status || "active",
        status_checklist: form.status_checklist || "ativo",
        user_id: user?.id,
        questions: csvData, // 🔥 Adicionando as perguntas diretamente
      };

      console.log("📝 Dados do checklist preparados para envio:", checklistData);

      // Criando FormData para envio do arquivo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("form", JSON.stringify(checklistData));

      console.log("📤 Enviando arquivo para processamento via Supabase Edge Function...");

      const { data, error } = await supabase.functions.invoke("process-checklist-csv", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
      });

      if (error) {
        console.error("❌ Erro na função Edge:", error);
        toast.error(`Erro na importação: ${error.message || "Falha desconhecida"}`);
        return false;
      }

      console.log("✅ Resposta da função Edge:", data);

      if (data?.success) {
        // Adicionando log para verificar o ID do checklist retornado
        const checklistId = data.checklist_id || data.id;
        console.log("Opening checklist:", checklistId);
        
        toast.success(`Checklist importado com sucesso! ${data.processed_items || 0} itens processados.`);
        
        // Retorna objeto contendo ID do checklist criado para facilitar navegação
        return {
          success: true,
          checklist_id: checklistId,
          id: checklistId,
          processed_items: data.processed_items || 0
        };
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
