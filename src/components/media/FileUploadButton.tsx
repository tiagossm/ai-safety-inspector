
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { toast } from 'sonner';

export interface FileUploadButtonProps {
  onFileUploaded: (mediaData: any) => void;
  onUploadStart?: () => void;
  buttonText?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function FileUploadButton({
  onFileUploaded,
  onUploadStart,
  buttonText = 'Upload File',
  accept = '*/*',
  disabled = false,
  className = '',
  variant = 'default'
}: FileUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useMediaUpload();
  
  const validateVideoFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve(true); // Não é vídeo, passa na validação
        return;
      }

      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        if (video.duration > 15) {
          toast.error('Vídeos devem ter no máximo 15 segundos de duração');
          resolve(false);
        } else {
          resolve(true);
        }
      });

      video.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        toast.error('Erro ao validar arquivo de vídeo');
        resolve(false);
      });

      video.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      setIsUploading(true);
      if (onUploadStart) onUploadStart();

      // Validar vídeo se necessário
      const isValidFile = await validateVideoFile(file);
      if (!isValidFile) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      const result = await uploadFile(file);
      
      if (result) {
        onFileUploaded(result);
        toast.success('Arquivo enviado com sucesso!');
      }
      
      // Reset input value to allow the same file to be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
        disabled={disabled || isUploading}
      />
      <Button
        variant={variant}
        disabled={disabled || isUploading}
        onClick={handleClick}
        className={className}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="mr-2 h-4 w-4" />
        )}
        {buttonText}
      </Button>
    </>
  );
}
