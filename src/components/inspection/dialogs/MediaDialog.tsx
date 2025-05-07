
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUpload } from "@/components/media/MediaUpload";
import { Button } from "@/components/ui/button";
import { MediaPreviewDialog } from '@/components/media/MediaPreviewDialog';
import { FileUploadButton } from '@/components/media/FileUploadButton';
import { MediaCaptureButton } from '@/components/media/MediaCaptureButton';
import { Camera, Video, Mic, FileText } from "lucide-react";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaUploaded: (mediaUrls: string[]) => void;
  response: {
    mediaUrls: string[];
  };
  allowedTypes?: string[];
}

export function MediaDialog({
  open,
  onOpenChange,
  onMediaUploaded,
  response,
  allowedTypes = ["*/*"]
}: MediaDialogProps) {
  const [activeTab, setActiveTab] = useState<string>('photo');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleMediaUploaded = (mediaData: any) => {
    if (mediaData?.url) {
      onMediaUploaded([mediaData.url]);
      onOpenChange(false);
    }
  };

  const acceptedTypes = {
    photo: "image/*",
    video: "video/*",
    audio: "audio/*",
    file: "*/*"
  };

  const showPhotoTab = !allowedTypes || allowedTypes.includes("image/*") || allowedTypes.includes("*/*");
  const showVideoTab = !allowedTypes || allowedTypes.includes("video/*") || allowedTypes.includes("*/*");
  const showAudioTab = !allowedTypes || allowedTypes.includes("audio/*") || allowedTypes.includes("*/*");
  const showFileTab = !allowedTypes || allowedTypes.includes("*/*") || allowedTypes.some(type => !["image/*", "video/*", "audio/*"].includes(type));
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar mídia</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-4">
              {showPhotoTab && (
                <TabsTrigger value="photo" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Foto</span>
                </TabsTrigger>
              )}
              
              {showVideoTab && (
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Vídeo</span>
                </TabsTrigger>
              )}
              
              {showAudioTab && (
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span>Áudio</span>
                </TabsTrigger>
              )}
              
              {showFileTab && (
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Arquivo</span>
                </TabsTrigger>
              )}
            </TabsList>

            {showPhotoTab && (
              <TabsContent value="photo" className="mt-4 space-y-4">
                <MediaCaptureButton 
                  type="photo"
                  onMediaCaptured={handleMediaUploaded}
                  className="w-full"
                  variant="default"
                />
                
                <div className="text-center text-sm text-muted-foreground">
                  ou
                </div>
                
                <FileUploadButton
                  onFileUploaded={handleMediaUploaded}
                  buttonText="Selecionar imagem do dispositivo"
                  accept="image/*"
                />
              </TabsContent>
            )}

            {showVideoTab && (
              <TabsContent value="video" className="mt-4 space-y-4">
                <MediaCaptureButton 
                  type="video"
                  onMediaCaptured={handleMediaUploaded}
                  className="w-full"
                  variant="default"
                />
                
                <div className="text-center text-sm text-muted-foreground">
                  ou
                </div>
                
                <FileUploadButton
                  onFileUploaded={handleMediaUploaded}
                  buttonText="Selecionar vídeo do dispositivo"
                  accept="video/*"
                />
              </TabsContent>
            )}

            {showAudioTab && (
              <TabsContent value="audio" className="mt-4 space-y-4">
                <MediaCaptureButton 
                  type="audio"
                  onMediaCaptured={handleMediaUploaded}
                  className="w-full"
                  variant="default"
                />
                
                <div className="text-center text-sm text-muted-foreground">
                  ou
                </div>
                
                <FileUploadButton
                  onFileUploaded={handleMediaUploaded}
                  buttonText="Selecionar áudio do dispositivo"
                  accept="audio/*"
                />
              </TabsContent>
            )}

            {showFileTab && (
              <TabsContent value="file" className="mt-4">
                <FileUploadButton
                  onFileUploaded={handleMediaUploaded}
                  buttonText="Selecionar arquivo"
                  accept={allowedTypes ? allowedTypes.join(',') : "*/*"}
                  className="w-full"
                  variant="default"
                />
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <MediaPreviewDialog 
        open={!!previewUrl} 
        onOpenChange={() => setPreviewUrl(null)}
        url={previewUrl}
      />
    </>
  );
}
