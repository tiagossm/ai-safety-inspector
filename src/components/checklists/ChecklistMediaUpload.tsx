import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, Mic, X, Image, AudioLines, Video } from "lucide-react";
import { useMediaUpload } from "@/hooks/useMediaUpload";

interface ChecklistMediaUploadProps {
  checklistId: string;
  itemId: string;
  onMediaUploaded: (url: string, type: "image" | "audio" | "video") => void;
  existingMedia?: string[];
  onRemoveMedia?: (url: string) => void;
}

export function ChecklistMediaUpload({
  checklistId,
  itemId,
  onMediaUploaded,
  existingMedia = [],
  onRemoveMedia
}: ChecklistMediaUploadProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "capture">("upload");
  const [mediaType, setMediaType] = useState<"image" | "audio" | "video">("image");
  const { uploadFile, isUploading, progress } = useMediaUpload();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Determina o tipo do arquivo
    let type: "image" | "audio" | "video";
    if (file.type.startsWith("image/")) {
      type = "image";
    } else if (file.type.startsWith("audio/")) {
      type = "audio";
    } else if (file.type.startsWith("video/")) {
      type = "video";
    } else {
      // Tipo não suportado
      return;
    }
    
    try {
      const result = await uploadFile(file);
      if (result && result.url) {
        onMediaUploaded(result.url, type);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
  };
  
  const startCapture = async () => {
    try {
      if (mediaType === "image") {
        // Abrir a câmera para tirar uma foto
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Aqui você implementaria a lógica para tirar a foto
        // Por simplicidade, usaremos o input file normal
      } else if (mediaType === "audio") {
        // Abrir o microfone para gravar áudio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Aqui você implementaria a lógica para gravar áudio
      } else if (mediaType === "video") {
        // Abrir a câmera para gravar vídeo
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Aqui você implementaria a lógica para gravar vídeo
      }
    } catch (error) {
      console.error("Erro ao acessar dispositivos de mídia:", error);
    }
  };
  
  const handleRemoveMedia = (url: string) => {
    if (onRemoveMedia) {
      onRemoveMedia(url);
    }
  };
  
  const getMediaTypeIcon = (url: string) => {
    if (url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i)) {
      return <Image className="h-4 w-4" />;
    } else if (url.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      return <AudioLines className="h-4 w-4" />;
    } else if (url.match(/\.(mp4|webm|avi|mov|wmv|mkv)$/i)) {
      return <Video className="h-4 w-4" />;
    }
    return <Image className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant={activeTab === "upload" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setActiveTab("upload")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <Button 
          variant={activeTab === "capture" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setActiveTab("capture")}
        >
          <Camera className="h-4 w-4 mr-2" />
          Capturar
        </Button>
      </div>
      
      {activeTab === "upload" && (
        <div className="space-y-2">
          <input
            type="file"
            id={`media-upload-${itemId}`}
            className="hidden"
            accept="image/*,audio/*,video/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label 
            htmlFor={`media-upload-${itemId}`}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {isUploading ? (
              <div className="space-y-2 w-full px-4">
                <p className="text-sm text-center">Enviando... {progress}%</p>
                <Progress value={progress} />
              </div>
            ) : (
              <>
                <Upload className="h-6 w-6 mb-2 text-gray-500" />
                <p className="text-sm text-center text-gray-500">
                  Clique para selecionar ou arraste um arquivo
                </p>
                <p className="text-xs text-center text-gray-400">
                  Suporta imagens, áudios e vídeos
                </p>
              </>
            )}
          </label>
        </div>
      )}
      
      {activeTab === "capture" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              variant={mediaType === "image" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setMediaType("image")}
            >
              <Camera className="h-4 w-4 mr-2" />
              Foto
            </Button>
            <Button 
              variant={mediaType === "audio" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setMediaType("audio")}
            >
              <Mic className="h-4 w-4 mr-2" />
              Áudio
            </Button>
            <Button 
              variant={mediaType === "video" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setMediaType("video")}
            >
              <Video className="h-4 w-4 mr-2" />
              Vídeo
            </Button>
          </div>
          
          <Button 
            onClick={startCapture}
            className="w-full"
            disabled={isUploading}
          >
            {isUploading ? "Enviando..." : `Capturar ${
              mediaType === "image" ? "Foto" : 
              mediaType === "audio" ? "Áudio" : "Vídeo"
            }`}
          </Button>
        </div>
      )}
      
      {existingMedia && existingMedia.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Arquivos anexados</p>
          <div className="grid grid-cols-2 gap-2">
            {existingMedia.map((url, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  {getMediaTypeIcon(url)}
                  <span className="text-xs truncate max-w-[100px]">
                    {url.split('/').pop()}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveMedia(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
