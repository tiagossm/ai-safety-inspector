
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, Mic, File, Upload, X } from "lucide-react";
import { MediaAttachments } from "./MediaAttachments";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaCaptureButton } from "@/components/media/MediaCaptureButton";
import { FileUploadButton } from "@/components/media/FileUploadButton";

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
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const handleMediaUploaded = (mediaData: any) => {
    if (mediaData && mediaData.url) {
      onMediaChange([...mediaUrls, mediaData.url]);
      toast.success("Mídia adicionada com sucesso!");
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
        const url = await onMediaUpload(file);
        if (url) {
          onMediaChange([...mediaUrls, url]);
          toast.success("Arquivo enviado com sucesso!");
        }
      } else {
        const { uploadFile } = useMediaUpload();
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
                onClick={() => setShowCameraDialog(true)}
                disabled={readOnly}
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
                onClick={() => setShowVideoDialog(true)}
                disabled={readOnly}
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
                onClick={() => setShowAudioDialog(true)}
                disabled={readOnly}
                className="flex items-center"
              >
                <Mic className="h-4 w-4 mr-2" />
                <span>Áudio</span>
              </Button>
            )}
            
            {allowsFiles && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFileDialog(true)}
                disabled={readOnly}
                className="flex items-center"
              >
                <File className="h-4 w-4 mr-2" />
                <span>Arquivo</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Display uploaded media */}
      {mediaUrls.length > 0 && (
        <MediaAttachments 
          mediaUrls={mediaUrls} 
          onDelete={readOnly ? undefined : handleDeleteMedia}
          readOnly={readOnly}
        />
      )}
      
      {/* Camera Dialog for taking photos */}
      {allowsPhoto && (
        <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tirar Foto</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              <MediaCaptureButton 
                type="photo"
                onMediaCaptured={(data) => {
                  handleMediaUploaded(data);
                  setShowCameraDialog(false);
                }}
                className="w-full"
                variant="default"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Video Dialog for recording videos */}
      {allowsVideo && (
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gravar Vídeo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              <MediaCaptureButton 
                type="video"
                onMediaCaptured={(data) => {
                  handleMediaUploaded(data);
                  setShowVideoDialog(false);
                }}
                className="w-full"
                variant="default"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Audio Dialog for recording audio */}
      {allowsAudio && (
        <Dialog open={showAudioDialog} onOpenChange={setShowAudioDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gravar Áudio</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              <MediaCaptureButton 
                type="audio"
                onMediaCaptured={(data) => {
                  handleMediaUploaded(data);
                  setShowAudioDialog(false);
                }}
                className="w-full"
                variant="default"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* File Upload Dialog */}
      {allowsFiles && (
        <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Arquivo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              <FileUploadButton 
                onFileUploaded={(data) => {
                  handleMediaUploaded(data);
                  setShowFileDialog(false);
                }}
                buttonText="Selecionar arquivo"
                className="w-full"
                variant="default"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
