
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklist } from "@/types/checklist";
import { useChecklistAI } from "@/hooks/checklist/form/useChecklistAI";
import { useChecklistImport } from "@/hooks/checklist/form/useChecklistImport";
import { useNavigate } from "react-router-dom";

interface ImportResult {
  id?: string;
  checklist_id?: string;
  success?: boolean;
  questions_added?: number;
}

interface AIResult {
  id?: string;
  data?: {
    checklist_id?: string;
  };
  success?: boolean;
}

export function useAdvancedSubmit() {
  const { generateAIChecklist } = useChecklistAI();
  const { importFromFile } = useChecklistImport();
  const navigate = useNavigate();

  const submitImportChecklist = async (file: File, form: NewChecklist) => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo para importar");
      return false;
    }

    console.log("Processing file import");
    console.log("File details:", file.name, file.type, `${Math.round(file.size / 1024)} KB`);
    
    const importResult = await importFromFile(file, form) as any;
    
    if (importResult && typeof importResult === 'object') {
      const success = importResult.success || true;
      
      let checklistId = null;
      if ('id' in importResult) {
        checklistId = importResult.id;
      } else if ('checklist_id' in importResult) {
        checklistId = importResult.checklist_id;
      }
      
      if (checklistId) {
        console.log("Import successful, checklist ID:", checklistId);
        navigate(`/checklists/${checklistId}`);
        return true;
      } else {
        // Success but no ID found
        navigate('/checklists');
        return true;
      }
    } else {
      console.error("Import failed or returned invalid result", importResult);
      toast.error("Falha ao importar checklist. Verifique o arquivo e tente novamente.");
      return false;
    }
  };

  const submitAIChecklist = async (form: NewChecklist, aiPrompt: string) => {
    if (!aiPrompt.trim()) {
      toast.error("Por favor, forneça um prompt para gerar o checklist");
      return false;
    }

    console.log("Processing AI generation");
    console.log("AI Prompt:", aiPrompt);
    
    const aiResult = await generateAIChecklist(form) as AIResult;
    
    if (aiResult && typeof aiResult === 'object') {
      let checklistId = null;
      
      if ('id' in aiResult) {
        checklistId = aiResult.id;
      } else if ('data' in aiResult) {
        const resultData = aiResult.data;
        if (resultData && 'checklist_id' in resultData) {
          checklistId = resultData.checklist_id;
        }
      }
      
      if (checklistId) {
        console.log("AI generation successful, checklist ID:", checklistId);
        navigate(`/checklists/${checklistId}`);
        return true;
      } else {
        // Success but no ID found
        console.log("Success but no ID returned, redirecting to main checklists page");
        navigate('/checklists');
        toast.info("Checklist criado, mas não foi possível abrir automaticamente.");
        return true;
      }
    } else {
      console.error("AI generation failed or returned invalid result", aiResult);
      toast.error("Falha ao gerar checklist com IA. Tente novamente.");
      return false;
    }
  };

  return {
    submitImportChecklist,
    submitAIChecklist
  };
}
