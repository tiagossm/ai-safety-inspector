
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, Mic, X, Image, AudioLines, Video } from "lucide-react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "sonner";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Determine file type
    let type: "image" | "audio" | "video";
    if (file.type.startsWith("image/")) {
      type = "image";
    } else if (file.type.startsWith("audio/")) {
      type = "audio";
    } else if (file.type.startsWith("video/")) {
      type = "video";
    } else {
      toast.error("Tipo de arquivo não suportado");
      return;
    }
    
    try {
      const result = await uploadFile(file);
      if (result && result.url) {
        onMediaUploaded(result.url, type);
        toast.success("Arquivo enviado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Falha ao enviar arquivo");
    }
  };
  
  const startCapture = async () => {
    try {
      if (mediaType === "image") {
        // Get camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } else if (mediaType === "audio") {
        // Show audio recording UI
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // Create media recorder for audio
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        
        mediaRecorder.onstop = handleStopRecording;
        
        mediaRecorder.start();
        setIsRecording(true);
        toast.info("Gravação de áudio iniciada");
      } else if (mediaType === "video") {
        // Show video recording UI
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        
        // Create media recorder for video
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        
        mediaRecorder.onstop = handleStopRecording;
        
        mediaRecorder.start();
        setIsRecording(true);
        toast.info("Gravação de vídeo iniciada");
      }
    } catch (error) {
      console.error("Erro ao acessar dispositivos de mídia:", error);
      toast.error("Não foi possível acessar sua câmera ou microfone");
    }
  };
  
  const handleStopRecording = async () => {
    if (recordedChunksRef.current.length === 0) return;
    
    try {
      const blob = new Blob(recordedChunksRef.current, {
        type: mediaType === "audio" ? "audio/webm" : "video/webm"
      });
      
      // Create a File from the blob
      const file = new File(
        [blob], 
        `recorded_${mediaType}_${Date.now()}.webm`, 
        { type: mediaType === "audio" ? "audio/webm" : "video/webm" }
      );
      
      const result = await uploadFile(file);
      if (result && result.url) {
        onMediaUploaded(result.url, mediaType);
        toast.success(`${mediaType === "audio" ? "Áudio" : "Vídeo"} enviado com sucesso!`);
      }
    } catch (error) {
      console.error(`Erro ao fazer upload do ${mediaType}:`, error);
      toast.error(`Falha ao enviar ${mediaType}`);
    } finally {
      recordedChunksRef.current = [];
      setIsRecording(false);
    }
  };
  
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Erro ao capturar imagem");
        return;
      }
      
      // Create a File object from the blob
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      try {
        const result = await uploadFile(file);
        if (result && result.url) {
          onMediaUploaded(result.url, "image");
          toast.success("Foto capturada com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao fazer upload da foto:", error);
      } finally {
        // Stop the stream
        stopCapture();
      }
    }, 'image/jpeg', 0.9);
  };
  
  const stopCapture = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    
    setIsRecording(false);
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
          onClick={() => {
            stopCapture();
            setActiveTab("upload");
          }}
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
              onClick={() => {
                stopCapture();
                setMediaType("image");
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Foto
            </Button>
            <Button 
              variant={mediaType === "audio" ? "default" : "outline"} 
              size="sm" 
              onClick={() => {
                stopCapture();
                setMediaType("audio");
              }}
            >
              <Mic className="h-4 w-4 mr-2" />
              Áudio
            </Button>
            <Button 
              variant={mediaType === "video" ? "default" : "outline"} 
              size="sm" 
              onClick={() => {
                stopCapture();
                setMediaType("video");
              }}
            >
              <Video className="h-4 w-4 mr-2" />
              Vídeo
            </Button>
          </div>
          
          {streamRef.current ? (
            <div className="space-y-4">
              {mediaType === "image" && (
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button 
                    onClick={capturePhoto}
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                  >
                    Tirar Foto
                  </Button>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
              
              {(mediaType === "audio" || mediaType === "video") && (
                <div className="relative">
                  {mediaType === "video" && (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                  {mediaType === "audio" && (
                    <div className="w-full h-24 flex items-center justify-center bg-muted rounded-md">
                      <AudioLines className="h-12 w-12 animate-pulse text-primary" />
                    </div>
                  )}
                  <div className="flex justify-center mt-2">
                    {isRecording ? (
                      <Button 
                        variant="destructive"
                        onClick={stopCapture}
                      >
                        Parar Gravação
                      </Button>
                    ) : (
                      <Button 
                        variant="default"
                        onClick={startCapture}
                      >
                        Iniciar Gravação
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {!isRecording && (
                <Button 
                  variant="outline"
                  onClick={stopCapture}
                  className="w-full"
                >
                  Cancelar
                </Button>
              )}
            </div>
          ) : (
            <Button 
              onClick={startCapture}
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? "Enviando..." : `Iniciar Captura de ${
                mediaType === "image" ? "Foto" : 
                mediaType === "audio" ? "Áudio" : "Vídeo"
              }`}
            </Button>
          )}
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
