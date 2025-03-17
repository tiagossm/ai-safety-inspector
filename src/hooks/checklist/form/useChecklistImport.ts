
import { useState } from "react";
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist"; 
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import * as XLSX from 'xlsx';

/**
 * Validates if the file is in correct format (CSV, XLS, XLSX)
 */
const validateFileFormat = (file: File): { valid: boolean; message?: string } => {
  if (!file) {
    return { valid: false, message: 'Nenhum arquivo selecionado' };
  }
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!['csv', 'xls', 'xlsx'].includes(fileExtension || '')) {
    return { 
      valid: false, 
      message: 'Formato de arquivo inválido. Apenas arquivos CSV, XLS e XLSX são suportados.' 
    };
  }
  
  return { valid: true };
};

// Parse CSV files
const parseCSV = (text: string) => {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    results.push(row);
  }
  
  return results;
};

// Parse Excel files
const parseExcel = (arrayBuffer: ArrayBuffer) => {
  try {
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error("Falha ao processar arquivo Excel.");
  }
};

export function useChecklistImport() {
  const createChecklist = useCreateChecklist();
  const { user, refreshSession } = useAuth();
  const [sessionValid, setSessionValid] = useState(false);
  
  // Check session validity on mount
  useState(() => {
    const validateSession = async () => {
      try {
        await refreshSession();
        const { data } = await supabase.auth.getSession();
        setSessionValid(!!data.session);
      } catch (error) {
        console.error("Session validation error:", error);
        setSessionValid(false);
      }
    };
    
    validateSession();
  });

  const getTemplateFileUrl = () => {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/templates/checklist_import_template.xlsx`;
  };

  const importFromFile = async (file: File, form: NewChecklist) => {
    // Validate file exists
    if (!file) {
      toast.error("Nenhum arquivo selecionado");
      return false;
    }
    
    // Validate file format
    const validation = validateFileFormat(file);
    if (!validation.valid) {
      toast.error(validation.message || "Arquivo inválido");
      return false;
    }
    
    try {
      console.log("Importing from file:", file.name, "Size:", Math.round(file.size / 1024), "KB");
      
      // First, ensure we have a valid token
      await refreshSession();
      
      // Create the checklist first
      const result = await createChecklist.mutateAsync({
        title: form.title || `Importado de ${file.name}`,
        description: form.description || `Importado de ${file.name}`,
        is_template: form.is_template || false,
        category: form.category || 'general',
        responsible_id: form.responsible_id,
        company_id: form.company_id,
        user_id: user?.id,
        due_date: form.due_date
      });
      
      if (!result || !result.id) {
        toast.error("Falha ao criar checklist");
        return false;
      }
      
      const checklistId = result.id;
      console.log("Checklist created with ID:", checklistId);
      
      // Now parse the file and add questions
      let questions: any[] = [];
      
      if (file.type === 'text/csv') {
        // Handle CSV files
        const text = await file.text();
        questions = parseCSV(text);
      } else if (file.type.includes('excel') || file.type.includes('spreadsheetml')) {
        // Handle Excel files
        const arrayBuffer = await file.arrayBuffer();
        questions = parseExcel(arrayBuffer);
      } else {
        toast.error("Formato de arquivo não suportado");
        return false;
      }
      
      if (!questions || questions.length === 0) {
        toast.warning("Nenhuma pergunta encontrada no arquivo");
        return {
          id: checklistId,
          success: true,
          questions_added: 0
        };
      }
      
      // Now add the questions to the checklist
      let successCount = 0;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        // Skip empty questions
        if (!q.pergunta && !q.question && !q.Pergunta && !q.Question) continue;
        
        try {
          const questionData = {
            checklist_id: checklistId,
            pergunta: q.pergunta || q.question || q.Pergunta || q.Question || `Pergunta ${i+1}`,
            tipo_resposta: q.tipo_resposta || q.type || q.Tipo || q.Type || "sim/não",
            obrigatorio: q.obrigatorio === "true" || q.obrigatorio === "sim" || true,
            ordem: i + 1,
            opcoes: q.opcoes ? JSON.stringify(q.opcoes.split ? q.opcoes.split(",").map(o => o.trim()) : q.opcoes) : null,
            permite_audio: q.permite_audio === "true" || q.permite_audio === "sim" || false,
            permite_video: q.permite_video === "true" || q.permite_video === "sim" || false,
            permite_foto: q.permite_foto === "true" || q.permite_foto === "sim" || false
          };
          
          const { error } = await supabase
            .from("checklist_itens")
            .insert(questionData);
            
          if (error) {
            console.error("Error adding question:", error);
          } else {
            successCount++;
          }
        } catch (itemError) {
          console.error("Error processing question:", itemError);
        }
      }
      
      console.log(`Successfully added ${successCount} of ${questions.length} questions`);
      
      toast.success(`Checklist importado com sucesso com ${successCount} perguntas!`);
      
      return {
        id: checklistId,
        success: true,
        questions_added: successCount
      };
    } catch (error: any) {
      console.error("Error importing checklist:", error);
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
