
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface FileUploadButtonProps {
  onFileUploaded: (fileData: any) => void;
  onUploadStart?: () => void;
  disabled?: boolean;
  accept?: string;
  buttonText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export function FileUploadButton({
  onFileUploaded,
  onUploadStart,
  disabled = false,
  accept = "image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar",
  buttonText = "Selecionar arquivo",
  variant = 'outline',
  className = ''
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useMediaUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      if (onUploadStart) {
        onUploadStart();
      }
      
      const result = await uploadFile(file);
      
      if (result) {
        onFileUploaded(result);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      // Clear the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <Button
        type="button"
        variant={variant}
        disabled={disabled || isUploading}
        onClick={() => fileInputRef.current?.click()}
        className={className}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {buttonText}
      </Button>
      
      {isUploading && progress > 0 && (
        <div className="mt-2">
          <div className="h-1.5 w-full bg-gray-200 rounded overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Enviando... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
