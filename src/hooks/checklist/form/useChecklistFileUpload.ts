
import { useState } from "react";

export function useChecklistFileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | File) => {
    if (e instanceof File) {
      setFile(e);
    } else if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return {
    file,
    handleFileChange
  };
}
