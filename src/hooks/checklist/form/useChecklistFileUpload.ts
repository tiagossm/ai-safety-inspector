
import { useState } from "react";

export function useChecklistFileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | File) => {
    if (e instanceof File) {
      setFile(e);
      console.log("File set directly:", e.name);
    } else if (e?.target?.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      console.log("File set from event:", e.target.files[0].name);
    } else {
      console.warn("No file found in event:", e);
    }
  };

  return {
    file,
    handleFileChange
  };
}
