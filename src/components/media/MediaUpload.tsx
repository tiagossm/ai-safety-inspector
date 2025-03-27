
import { useState } from 'react';
import { FileUploadButton } from './FileUploadButton';
import { MediaCaptureButton } from './MediaCaptureButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Image, FileText, Music, Video, Camera } from 'lucide-react';

interface MediaUploadProps {
  onMediaUploaded: (mediaData: any) => void;
  className?: string;
  allowedTypes?: ("photo" | "video" | "audio" | "file")[];
}

export function MediaUpload({ 
  onMediaUploaded, 
  className = '',
  allowedTypes = ["photo", "video", "audio", "file"]
}: MediaUploadProps) {
  const [activeTab, setActiveTab] = useState(allowedTypes.includes("file") ? 'upload' : 'capture');
  const [uploading, setUploading] = useState(false);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleMediaUploaded = (mediaData: any) => {
    setUploading(false);
    if (mediaData && mediaData.url) {
      onMediaUploaded(mediaData);
    }
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
                onUploadStart={() => setUploading(true)}
                disabled={uploading}
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
                    onCaptureStart={() => setUploading(true)}
                    disabled={uploading}
                  />
                )}
                {allowedTypes.includes("video") && (
                  <MediaCaptureButton 
                    type="video" 
                    onMediaCaptured={handleMediaUploaded} 
                    onCaptureStart={() => setUploading(true)}
                    disabled={uploading}
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
                onCaptureStart={() => setUploading(true)}
                disabled={uploading}
              />
            </TabsContent>
          )}
        </Tabs>
        
        {uploading && (
          <div className="mt-3 text-center">
            <div className="h-1 w-full bg-gray-200 rounded overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enviando arquivo...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
