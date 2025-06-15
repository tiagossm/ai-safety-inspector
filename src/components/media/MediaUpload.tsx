
import { useState } from 'react';
import { FileUploadButton } from './FileUploadButton';
import { MediaCaptureButton } from './MediaCaptureButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Image, FileText, Music, Video, Camera } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface MediaUploadProps {
  onMediaUploaded: (mediaData: any) => void;
  className?: string;
  allowedTypes?: ("photo" | "video" | "audio" | "file")[];
  disabled?: boolean;
}

export function MediaUpload({ 
  onMediaUploaded, 
  className = '',
  allowedTypes = ["photo", "video", "audio", "file"],
  disabled = false
}: MediaUploadProps) {
  const [activeTab, setActiveTab] = useState(allowedTypes.includes("file") ? 'upload' : 'capture');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleMediaUploaded = (mediaData: any) => {
    setUploading(false);
    setProgress(100);
    
    console.log('[MediaUpload] Media uploaded:', mediaData);
    
    if (mediaData && mediaData.url) {
      // Garantir que a URL está no formato correto para exibição
      const processedMediaData = {
        ...mediaData,
        url: mediaData.url,
        publicUrl: mediaData.url // Adicionar publicUrl para compatibilidade
      };
      
      console.log('[MediaUpload] Processed media data:', processedMediaData);
      onMediaUploaded(processedMediaData);
    }
  };

  const simulateProgress = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(oldProgress + 5, 95);
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  };
  
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            {allowedTypes.includes("file") && (
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Arquivo</span>
              </TabsTrigger>
            )}
            
            {(allowedTypes.includes("photo") || allowedTypes.includes("video")) && (
              <TabsTrigger value="capture" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Câmera</span>
              </TabsTrigger>
            )}
            
            {allowedTypes.includes("audio") && (
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Gravar</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          {allowedTypes.includes("file") && (
            <TabsContent value="upload" className="mt-0">
              <FileUploadButton 
                onFileUploaded={handleMediaUploaded}
                buttonText="Selecionar arquivo"
                onUploadStart={() => {
                  setUploading(true);
                  simulateProgress();
                }}
                disabled={disabled || uploading}
              />
            </TabsContent>
          )}
          
          {(allowedTypes.includes("photo") || allowedTypes.includes("video")) && (
            <TabsContent value="capture" className="mt-0">
              <div className="grid grid-cols-1 gap-2">
                {allowedTypes.includes("photo") && (
                  <MediaCaptureButton 
                    type="photo" 
                    onMediaCaptured={handleMediaUploaded} 
                    onCaptureStart={() => {
                      setUploading(true);
                      simulateProgress();
                    }}
                    disabled={disabled || uploading}
                  />
                )}
                {allowedTypes.includes("video") && (
                  <MediaCaptureButton 
                    type="video" 
                    onMediaCaptured={handleMediaUploaded} 
                    onCaptureStart={() => {
                      setUploading(true);
                      simulateProgress();
                    }}
                    disabled={disabled || uploading}
                  />
                )}
              </div>
            </TabsContent>
          )}
          
          {allowedTypes.includes("audio") && (
            <TabsContent value="record" className="mt-0">
              <MediaCaptureButton 
                type="audio" 
                onMediaCaptured={handleMediaUploaded}
                onCaptureStart={() => {
                  setUploading(true);
                  simulateProgress();
                }}
                disabled={disabled || uploading}
              />
            </TabsContent>
          )}
        </Tabs>
        
        {uploading && (
          <div className="mt-3 text-center">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">Enviando arquivo... {progress}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
