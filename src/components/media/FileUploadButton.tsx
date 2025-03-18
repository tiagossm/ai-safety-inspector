
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { Upload, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface FileUploadButtonProps {
  acceptTypes?: string;
  onFileUploaded: (fileData: any) => void;
  className?: string;
  buttonText?: string;
}

export function FileUploadButton({ 
  acceptTypes = "image/*,video/*,audio/*,.pdf,.doc,.docx,.xlsx", 
  onFileUploaded,
  className = '',
  buttonText = "Enviar arquivo"
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useMediaUpload();
  
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await uploadFile(file);
      onFileUploaded(result);
      toast.success('Arquivo enviado com sucesso!');
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo');
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        accept={acceptTypes}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={triggerFileInput}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Enviando... {progress}%
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 mr-2" />
            {buttonText}
          </>
        )}
      </Button>
    </div>
  );
}
