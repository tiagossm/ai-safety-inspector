
export interface MediaCaptureButtonProps {
  type: 'photo' | 'video' | 'audio';
  onMediaCaptured: (mediaData: any) => void;
  onCaptureStart?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
