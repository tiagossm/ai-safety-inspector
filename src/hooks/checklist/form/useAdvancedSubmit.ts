
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useChecklistAI } from "@/hooks/checklist/form/useChecklistAI";
import { useChecklistImport } from "@/hooks/checklist/form/useChecklistImport";
import { useNavigate } from "react-router-dom";

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
    
    const importResult = await importFromFile(file, form);
    
    if (importResult && typeof importResult === 'object' && importResult.success) {
      // Instead of saving directly, store the data in session storage for the editor
      const editorData = {
        checklistData: importResult.checklistData,
        questions: importResult.questions,
        mode: importResult.mode
      };
      
      console.log("Storing import data for editor:", editorData);
      
      // Store the data in sessionStorage
      sessionStorage.setItem('checklistEditorData', JSON.stringify(editorData));
      
      // Redirect to editor
      navigate('/checklists/editor');
      return true;
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
    
    const aiResult = await generateAIChecklist(form);
    
    if (aiResult && typeof aiResult === 'object' && aiResult.success) {
      // Instead of saving directly, store the data in session storage for the editor
      const editorData = {
        checklistData: aiResult.checklistData,
        questions: aiResult.questions,
        mode: aiResult.mode
      };
      
      console.log("Storing AI data for editor:", editorData);
      
      // Store the data in sessionStorage
      sessionStorage.setItem('checklistEditorData', JSON.stringify(editorData));
      
      // Redirect to editor
      navigate('/checklists/editor');
      return true;
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
