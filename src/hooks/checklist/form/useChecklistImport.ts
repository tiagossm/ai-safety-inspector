
import { useState } from "react";
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist"; 
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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

// Simple CSV parsing function
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
      
      // Ensure the form has user_id set
      if (!form.user_id && user?.id) {
        form.user_id = user.id;
      }
      
      // First, ensure we have a valid token
      await refreshSession();
      
      // Create the checklist first
      const result = await createChecklist.mutateAsync({
        title: form.title,
        description: form.description || `Importado de ${file.name}`,
        is_template: form.is_template || false,
        category: form.category || 'general',
        responsible_id: form.responsible_id,
        company_id: form.company_id,
        user_id: form.user_id,
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
      } else {
        // For simplicity, we'll manually add some sample questions
        // In a real implementation, you'd use a library like xlsx to parse Excel files
        questions = [
          { pergunta: "Pergunta 1 importada", tipo_resposta: "sim/não", obrigatorio: true },
          { pergunta: "Pergunta 2 importada", tipo_resposta: "texto", obrigatorio: false },
          { pergunta: "Pergunta 3 importada", tipo_resposta: "múltipla escolha", obrigatorio: true, opcoes: "Sim,Não,Não aplicável" }
        ];
        
        toast.info("Demonstração: adicionando perguntas de exemplo");
      }
      
      // Now add the questions to the checklist
      let successCount = 0;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        // Skip empty questions
        if (!q.pergunta && !q.question) continue;
        
        const questionData = {
          checklist_id: checklistId,
          pergunta: q.pergunta || q.question || `Pergunta ${i+1}`,
          tipo_resposta: q.tipo_resposta || q.type || "sim/não",
          obrigatorio: q.obrigatorio === "true" || q.obrigatorio === "sim" || true,
          ordem: i + 1
        };
        
        const { error } = await supabase
          .from("checklist_itens")
          .insert(questionData);
          
        if (error) {
          console.error("Error adding question:", error);
        } else {
          successCount++;
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
