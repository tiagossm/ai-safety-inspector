import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Camera, Video, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MediaUploadButtonProps {
  onMediaUpload: (file: File) => Promise<string | null>;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function MediaUploadButton({
  onMediaUpload,
  disabled = false,
  variant = "outline",
  size = "sm"
}: MediaUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setIsUploading(true);
      const file = event.target.files[0];
      await onMediaUpload(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Erro ao enviar arquivo: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsUploading(false);
      // Clear the input value to allow uploading the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };
  
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // For now, camera and video capture are not implemented
  // They would require additional components or use of the MediaDevices API
  const handleCameraCapture = () => {
    toast.info("Captura de câmera será implementada em breve");
  };
  
  const handleVideoCapture = () => {
    toast.info("Gravação de vídeo será implementada em breve");
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" 
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            disabled={disabled || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
            <span>Anexar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={triggerFileUpload}>
            <Paperclip className="h-4 w-4 mr-2" />
            <span>Upload de arquivo</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCameraCapture}>
            <Camera className="h-4 w-4 mr-2" />
            <span>Tirar foto</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleVideoCapture}>
            <Video className="h-4 w-4 mr-2" />
            <span>Gravar vídeo</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
