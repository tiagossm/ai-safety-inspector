
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { toast } from 'sonner';

interface FileUploadButtonProps {
  onFileUploaded: (fileData: any) => void;
  buttonText?: string;
  acceptTypes?: string;
  className?: string;
  disabled?: boolean;
  onUploadStart?: () => void;
}

export function FileUploadButton({
  onFileUploaded,
  buttonText = 'Upload File',
  acceptTypes = 'image/*,video/*,audio/*,application/pdf',
  className = '',
  disabled = false,
  onUploadStart
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useMediaUpload();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedFileName(file.name);
    if (onUploadStart) onUploadStart();
    
    try {
      const fileData = await uploadFile(file);
      if (fileData) {
        onFileUploaded(fileData);
        toast.success('Arquivo enviado com sucesso!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      // Reset the input value so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFileName(null);
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptTypes}
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />
      
      <Button
        variant="outline"
        className="w-full"
        onClick={handleUploadClick}
        disabled={disabled || isUploading}
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        {selectedFileName || buttonText}
      </Button>
      
      {isUploading && (
        <div className="mt-2">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            {progress < 100 ? `Enviando ${progress}%` : 'Processando...'}
          </p>
        </div>
      )}
    </div>
  );
}
