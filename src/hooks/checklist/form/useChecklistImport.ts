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
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
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
    toast.error("Nenhum arquivo selecionado");
    return false;
  }

  const validation = validateFileFormat(file);
  if (!validation.valid) {
    toast.error(validation.message);
    return false;
  }

  try {
    await refreshSession();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      toast.error("Sessão inválida. Faça login novamente.");
      return false;
    }

    const jwt = sessionData.session.access_token;

    const checklistData = {
      ...form,
      status: form.status || "active",
      status_checklist: form.status_checklist || "ativo",
      user_id: user?.id // Corrigido
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('form', JSON.stringify(checklistData));

    const { data, error } = await supabase.functions.invoke('process-checklist-csv', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}` },
      body: formData
    });

    if (error) {
      toast.error(`Erro na importação: ${error.message}`);
      return false;
    }

    if (data?.success) {
      toast.success(`Checklist importado com sucesso! ${data.processed_items || 0} itens processados.`);
      return data;
    } else {
      toast.error(data?.error || "Erro ao importar checklist");
      return false;
    }
  } catch (error: any) {
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
