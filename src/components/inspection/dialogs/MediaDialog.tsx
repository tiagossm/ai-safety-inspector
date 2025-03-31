
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mic, Video, Upload } from "lucide-react";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaUploaded: (mediaUrls: string[]) => void;
  response?: any;
  allowedTypes?: string[];
}

export function MediaDialog({
  open,
  onOpenChange,
  onMediaUploaded,
  response,
  allowedTypes = ["photo", "video", "audio"]
}: MediaDialogProps) {
  const handleMediaUpload = (mediaUrl: string) => {
    // For backward compatibility, wrap single URL in an array
    onMediaUploaded([mediaUrl]);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar mídia</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="photo" className="mt-4">
          <TabsList className="grid grid-cols-4">
            {allowedTypes.includes("photo") && (
              <TabsTrigger value="photo">
                <Camera className="h-4 w-4 mr-2" />
                Foto
              </TabsTrigger>
            )}
            {allowedTypes.includes("video") && (
              <TabsTrigger value="video">
                <Video className="h-4 w-4 mr-2" />
                Vídeo
              </TabsTrigger>
            )}
            {allowedTypes.includes("audio") && (
              <TabsTrigger value="audio">
                <Mic className="h-4 w-4 mr-2" />
                Áudio
              </TabsTrigger>
            )}
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Arquivo
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photo" className="mt-4">
            <div className="text-center p-8 border rounded-lg">
              <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Tirar foto</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Clique para capturar uma foto com sua câmera
              </p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm"
                onClick={() => handleMediaUpload("https://example.com/sample-photo.jpg")}
              >
                Capturar foto
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="mt-4">
            <div className="text-center p-8 border rounded-lg">
              <Video className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Gravar vídeo</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Grave um vídeo de até 15 segundos
              </p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm"
                onClick={() => handleMediaUpload("https://example.com/sample-video.mp4")}
              >
                Iniciar gravação
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="mt-4">
            <div className="text-center p-8 border rounded-lg">
              <Mic className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Gravar áudio</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Grave uma nota de áudio
              </p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm"
                onClick={() => handleMediaUpload("https://example.com/sample-audio.mp3")}
              >
                Iniciar gravação
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <div className="text-center p-8 border rounded-lg">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Enviar arquivo</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Envie um documento, imagem ou outro arquivo
              </p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm"
                onClick={() => handleMediaUpload("https://example.com/sample-file.pdf")}
              >
                Selecionar arquivo
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
