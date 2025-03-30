
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Camera, Mic, Video, Upload, 
  File, X, Image
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMediaUpload } from "@/hooks/useMediaUpload";

interface MediaCaptureMenuProps {
  onAddMedia: (url: string) => void;
  mediaUrls?: string[];
}

export function MediaCaptureMenu({ onAddMedia, mediaUrls }: MediaCaptureMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("photo");
  const [isCapturing, setIsCapturing] = useState(false);
  const { uploadFile, uploadMedia, isUploading, progress } = useMediaUpload();
  
  // Count media by type
  const getMediaCounts = () => {
    if (!mediaUrls || !mediaUrls.length) return null;
    
    const counts = {
      images: 0,
      videos: 0,
      audios: 0,
      files: 0
    };
    
    mediaUrls.forEach(url => {
      if (url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i)) {
        counts.images++;
      } else if (url.match(/\.(mp4|webm|mov|avi)$/i)) {
        counts.videos++;
      } else if (url.match(/\.(mp3|wav|ogg|m4a)$/i)) {
        counts.audios++;
      } else {
        counts.files++;
      }
    });
    
    return counts;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await uploadFile(file);
      if (result && result.url) {
        onAddMedia(result.url);
        toast.success("Arquivo enviado com sucesso");
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("Erro ao enviar arquivo");
      console.error("Upload error:", error);
    }
  };

  // Camera capture
  const handleCapturePhoto = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement('video');
      const canvasElement = document.createElement('canvas');
      
      videoElement.srcObject = stream;
      await videoElement.play();
      
      // Set canvas size to video size
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      
      // Draw video frame to canvas
      const context = canvasElement.getContext('2d');
      context?.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      
      // Stop all video streams
      stream.getTracks().forEach(track => track.stop());
      
      // Convert canvas to blob
      canvasElement.toBlob(async (blob) => {
        if (blob) {
          const result = await uploadMedia(blob, 'image/jpeg', 'photo.jpg');
          if (result && result.url) {
            onAddMedia(result.url);
            toast.success("Foto capturada com sucesso");
            setIsOpen(false);
          }
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      toast.error("Erro ao capturar foto");
      console.error("Camera error:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Video recording
  const handleRecordVideo = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const result = await uploadMedia(blob, 'video/mp4', 'video.mp4');
        
        if (result && result.url) {
          onAddMedia(result.url);
          toast.success("Vídeo gravado com sucesso");
          setIsOpen(false);
        }
        
        // Stop all media tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      toast.info("Gravando vídeo (15s)...");
      
      // Stop recording after 15 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 15000);
    } catch (error) {
      toast.error("Erro ao gravar vídeo");
      console.error("Video recording error:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Audio recording
  const handleRecordAudio = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        const result = await uploadMedia(blob, 'audio/mp3', 'audio.mp3');
        
        if (result && result.url) {
          onAddMedia(result.url);
          toast.success("Áudio gravado com sucesso");
          setIsOpen(false);
        }
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Create a record button to stop recording
      const stopRecording = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };
      
      // Start recording
      mediaRecorder.start();
      toast.info("Gravando áudio...", { 
        action: {
          label: "Parar",
          onClick: stopRecording
        },
        duration: 60000
      });
      
      // Auto-stop after 2 minutes as a safety measure
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 120000);
    } catch (error) {
      toast.error("Erro ao gravar áudio");
      console.error("Audio recording error:", error);
    } finally {
      setIsCapturing(false);
    }
  };
  
  const mediaCounts = getMediaCounts();
  const hasMedia = mediaUrls && mediaUrls.length > 0;
  
  return (
    <div className="mt-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 text-xs"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Mídia</span>
            {hasMedia && (
              <Badge variant="secondary" className="ml-1">
                {mediaUrls.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Mídia</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="photo" className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Foto</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Vídeo</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-1">
                <Mic className="h-4 w-4" />
                <span className="hidden sm:inline">Áudio</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Arquivo</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="photo" className="space-y-4">
              <div className="flex justify-center">
                <Button 
                  onClick={handleCapturePhoto} 
                  disabled={isCapturing || isUploading}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Capturar Foto</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="video" className="space-y-4">
              <div className="flex justify-center">
                <Button 
                  onClick={handleRecordVideo} 
                  disabled={isCapturing || isUploading}
                  className="flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Gravar Vídeo (15s)</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="audio" className="space-y-4">
              <div className="flex justify-center">
                <Button 
                  onClick={handleRecordAudio} 
                  disabled={isCapturing || isUploading}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  <span>Gravar Áudio</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="flex justify-center">
                <Button 
                  asChild 
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Selecione um Arquivo</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                  </label>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {isUploading && (
            <div className="mt-4">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1">Enviando: {progress}%</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {mediaCounts && (
        <div className="mt-1.5 text-xs text-muted-foreground">
          {mediaCounts.images > 0 && (
            <span className="mr-2">
              <Image className="h-3 w-3 inline mr-1" />
              {mediaCounts.images}
            </span>
          )}
          {mediaCounts.videos > 0 && (
            <span className="mr-2">
              <Video className="h-3 w-3 inline mr-1" />
              {mediaCounts.videos}
            </span>
          )}
          {mediaCounts.audios > 0 && (
            <span className="mr-2">
              <Mic className="h-3 w-3 inline mr-1" />
              {mediaCounts.audios}
            </span>
          )}
          {mediaCounts.files > 0 && (
            <span>
              <File className="h-3 w-3 inline mr-1" />
              {mediaCounts.files}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
