
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useChecklistImport } from "./useChecklistImport";

export function useImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const { importFromFile, isImporting } = useChecklistImport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      // Validar tipo do arquivo
      const validTypes = [
        'text/csv', 
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.endsWith('.csv') && 
          !selectedFile.name.endsWith('.xlsx') && 
          !selectedFile.name.endsWith('.xls')) {
        toast.error("Por favor, selecione um arquivo CSV ou Excel");
        return;
      }
      
      console.log("Arquivo selecionado:", selectedFile.name);
    } else {
      console.log("Arquivo removido");
    }
    
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleSubmit = async (form: NewChecklist): Promise<boolean> => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo para importar");
      return false;
    }
    
    if (!form.title) {
      toast.error("O título do checklist é obrigatório");
      return false;
    }
    
    try {
      const result = await importFromFile(file, form);
      
      if (result.success) {
        toast.success("Arquivo importado com sucesso!");
        return true;
      } else {
        toast.error(result.message || "Erro ao importar arquivo");
        return false;
      }
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
      toast.error(`Erro ao importar: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return false;
    }
  };

  return {
    file,
    handleFileChange,
    clearFile,
    handleSubmit,
    isImporting
  };
}
