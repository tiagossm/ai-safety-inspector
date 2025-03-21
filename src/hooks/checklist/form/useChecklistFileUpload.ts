
import { useState } from "react";
import { toast } from "sonner";

export function useChecklistFileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e?.target?.files && e.target.files.length > 0) {
        setFile(e.target.files[0]);
        console.log("File set from event:", e.target.files[0].name);
      } else {
        console.warn("No file found in event:", e);
        toast.error("Falha ao selecionar arquivo. Tente novamente.");
      }
    } catch (error) {
      console.error("Error in handleFileChange:", error);
      toast.error("Erro ao processar arquivo");
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return {
    file,
    handleFileChange,
    clearFile
  };
}
