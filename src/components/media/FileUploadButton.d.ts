
export interface FileUploadButtonProps {
  onFileUploaded: (mediaData: any) => void;
  onUploadStart?: () => void;
  buttonText?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
