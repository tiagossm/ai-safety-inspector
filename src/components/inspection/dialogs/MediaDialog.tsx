
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Camera, 
  Mic, 
  Video, 
  Upload,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaUploaded: (url: string) => void;
  response: any;
  allowedTypes: string[];
}

type MediaType = "photo" | "audio" | "video" | "document";

export function MediaDialog({
  open,
  onOpenChange,
  onMediaUploaded,
  response,
  allowedTypes
}: MediaDialogProps) {
  const [selectedType, setSelectedType] = useState<MediaType>("photo");
  const [isUploading, setIsUploading] = useState(false);
  
  // Mock upload function - in a real app, this would handle the actual file upload
  const handleUpload = async () => {
    setIsUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock upload delay
      
      // Mock successful upload with a fake URL
      const mockUrl = `https://example.com/uploads/${Date.now()}_${selectedType}`;
      onMediaUploaded(mockUrl);
      
      toast.success(`${getMediaTypeLabel(selectedType)} enviado com sucesso!`);
      onOpenChange(false);
    } catch (error) {
      toast.error(`Erro ao enviar ${getMediaTypeLabel(selectedType).toLowerCase()}`);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Get a friendly label for the media type
  const getMediaTypeLabel = (type: MediaType): string => {
    switch (type) {
      case "photo": return "Foto";
      case "audio": return "Áudio";
      case "video": return "Vídeo";
      case "document": return "Documento";
    }
  };
  
  // Get icon for the media type
  const getMediaTypeIcon = (type: MediaType) => {
    switch (type) {
      case "photo": return <Camera className="h-5 w-5" />;
      case "audio": return <Mic className="h-5 w-5" />;
      case "video": return <Video className="h-5 w-5" />;
      case "document": return <Upload className="h-5 w-5" />;
    }
  };
  
  // Filter available media types based on allowed types
  const availableMediaTypes: MediaType[] = [
    ...(allowedTypes.includes("photo") ? ["photo" as MediaType] : []),
    ...(allowedTypes.includes("audio") ? ["audio" as MediaType] : []),
    ...(allowedTypes.includes("video") ? ["video" as MediaType] : []),
    // Always allow document uploads
    "document" as MediaType
  ];
  
  // If no specific media types are allowed, enable all
  const mediaOptions = availableMediaTypes.length > 0 
    ? availableMediaTypes 
    : ["photo", "audio", "video", "document"] as MediaType[];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Mídia</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <RadioGroup 
            defaultValue={selectedType} 
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as MediaType)}
            className="flex flex-col space-y-2"
          >
            {mediaOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`media-type-${type}`} />
                <Label 
                  htmlFor={`media-type-${type}`}
                  className="flex items-center cursor-pointer"
                >
                  {getMediaTypeIcon(type)}
                  <span className="ml-2">
                    {type === "photo" && "Tirar Foto"}
                    {type === "audio" && "Gravar Áudio"}
                    {type === "video" && "Gravar Vídeo (15s)"}
                    {type === "document" && "Enviar Documento (PDF/Imagem)"}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="text-sm text-muted-foreground">
            {selectedType === "photo" && "Tire uma foto da situação observada."}
            {selectedType === "audio" && "Grave um áudio com observações importantes."}
            {selectedType === "video" && "Grave um vídeo curto (máximo 15 segundos)."}
            {selectedType === "document" && "Envie um documento relacionado à pergunta."}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleUpload} 
            disabled={isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Enviando..." : "Iniciar Captura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
