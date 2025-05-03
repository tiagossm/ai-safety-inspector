
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, Mic, File, Upload, X } from "lucide-react";
import { MediaAttachments } from "./MediaAttachments";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MediaUploadInputProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  onMediaUpload?: (file: File) => Promise<string | null>;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  readOnly?: boolean;
}

export function MediaUploadInput({
  mediaUrls = [],
  onMediaChange,
  onMediaUpload,
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  readOnly = false
}: MediaUploadInputProps) {
  const { uploadFile, uploadMedia, isUploading, progress } = useMediaUpload();
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      
      if (onMediaUpload) {
        const url = await onMediaUpload(file);
        if (url) {
          toast.success("Arquivo enviado com sucesso!");
        }
      } else {
        const result = await uploadFile(file);
        
        if (result?.url) {
          onMediaChange([...mediaUrls, result.url]);
          toast.success("Arquivo enviado com sucesso!");
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao enviar arquivo.");
    }
    
    // Clear input value to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const handleMediaCapture = async (type: 'photo' | 'video' | 'audio') => {
    if (readOnly) return;
    if (type === 'photo') {
      setShowCameraDialog(true);
    } else if (type === 'video') {
      setShowVideoDialog(true);
    } else if (type === 'audio') {
      setShowAudioDialog(true);
    }
  };
  
  const handleDeleteMedia = (urlToDelete: string) => {
    if (readOnly) return;
    const updatedUrls = mediaUrls.filter(url => url !== urlToDelete);
    onMediaChange(updatedUrls);
    toast.success("Anexo removido.");
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setDragOver(false);
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    const file = e.dataTransfer.files[0];
    
    try {
      if (onMediaUpload) {
        await onMediaUpload(file);
      } else {
        const result = await uploadFile(file);
        
        if (result?.url) {
          onMediaChange([...mediaUrls, result.url]);
          toast.success("Arquivo enviado com sucesso!");
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao enviar arquivo.");
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) {
      setDragOver(true);
    }
  };
  
  const handleDragLeave = () => {
    setDragOver(false);
  };
  
  // If in readOnly mode, just show the attachments without upload functionality
  if (readOnly && mediaUrls.length > 0) {
    return <MediaAttachments mediaUrls={mediaUrls} readOnly={true} />;
  } else if (readOnly) {
    return null; // Don't show anything if readOnly and no attachments
  }
  
  return (
    <div className="space-y-4">
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-md p-4 transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
        } ${readOnly ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            Arraste arquivos aqui ou clique para fazer upload
          </p>
          
          {/* Media Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {allowsPhoto && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMediaCapture('photo')}
                disabled={isUploading || readOnly}
                className="flex items-center"
              >
                <Camera className="h-4 w-4 mr-2" />
                <span>Foto</span>
              </Button>
            )}
            
            {allowsVideo && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMediaCapture('video')}
                disabled={isUploading || readOnly}
                className="flex items-center"
              >
                <Video className="h-4 w-4 mr-2" />
                <span>Vídeo</span>
              </Button>
            )}
            
            {allowsAudio && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMediaCapture('audio')}
                disabled={isUploading || readOnly}
                className="flex items-center"
              >
                <Mic className="h-4 w-4 mr-2" />
                <span>Áudio</span>
              </Button>
            )}
            
            {allowsFiles && (
              <div>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || readOnly}
                />
                <label htmlFor="file-upload">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading || readOnly}
                    className="flex items-center cursor-pointer"
                    asChild
                  >
                    <span>
                      <File className="h-4 w-4 mr-2" />
                      <span>Arquivo</span>
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar when uploading */}
      {isUploading && (
        <div className="w-full">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center mt-1">Enviando... {progress}%</p>
        </div>
      )}
      
      {/* Display uploaded media */}
      {mediaUrls.length > 0 && (
        <MediaAttachments 
          mediaUrls={mediaUrls} 
          onDelete={readOnly ? undefined : handleDeleteMedia}
          readOnly={readOnly}
        />
      )}
      
      {/* Camera Dialog for taking photos */}
      <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tirar Foto</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Funcionalidade a ser implementada</p>
            <Button
              className="mt-4"
              onClick={() => setShowCameraDialog(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Video Dialog for recording videos */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gravar Vídeo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Funcionalidade a ser implementada</p>
            <Button
              className="mt-4"
              onClick={() => setShowVideoDialog(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Audio Dialog for recording audio */}
      <Dialog open={showAudioDialog} onOpenChange={setShowAudioDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gravar Áudio</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Funcionalidade a ser implementada</p>
            <Button
              className="mt-4"
              onClick={() => setShowAudioDialog(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
