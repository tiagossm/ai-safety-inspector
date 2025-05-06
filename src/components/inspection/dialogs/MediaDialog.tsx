
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaUpload } from "@/components/media/MediaUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadButton } from "@/components/media/FileUploadButton";
import { MediaCaptureButton } from "@/components/media/MediaCaptureButton";
import { Button } from "@/components/ui/button";
import { Camera, Video, Mic, FileText } from "lucide-react";

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
  allowedTypes = ["image/*", "video/*", "audio/*"]
}: MediaDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("photo");
  
  const handleMediaUploaded = (mediaData: any) => {
    if (mediaData && mediaData.url) {
      onMediaUploaded([...response?.mediaUrls || [], mediaData.url]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Mídia</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
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
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Arquivo</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photo" className="space-y-4 mt-2">
            <MediaCaptureButton 
              type="photo"
              onMediaCaptured={handleMediaUploaded}
              className="w-full"
              variant="default"
            />
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4 mt-2">
            <MediaCaptureButton 
              type="video"
              onMediaCaptured={handleMediaUploaded}
              className="w-full"
              variant="default"
            />
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4 mt-2">
            <MediaCaptureButton 
              type="audio"
              onMediaCaptured={handleMediaUploaded}
              className="w-full"
              variant="default"
            />
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4 mt-2">
            <FileUploadButton 
              onFileUploaded={handleMediaUploaded}
              buttonText="Selecionar arquivo"
              className="w-full"
              variant="default"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
