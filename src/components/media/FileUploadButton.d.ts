export interface FileUploadButtonProps {
  onFileUploaded: (mediaData: any) => void;
  onUploadStart?: () => void;
  buttonText?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Visual style of the button. Use 'default' for primary actions.
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
