
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
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
                onFileUploaded={onMediaUploaded}
                buttonText="Selecionar arquivo"
              />
            </TabsContent>
          )}
          
          {(allowedTypes.includes("photo") || allowedTypes.includes("video")) && (
            <TabsContent value="capture" className="mt-0">
              <div className="grid grid-cols-1 gap-2">
                {allowedTypes.includes("photo") && (
                  <MediaCaptureButton 
                    type="photo" 
                    onMediaCaptured={onMediaUploaded} 
                  />
                )}
                {allowedTypes.includes("video") && (
                  <MediaCaptureButton 
                    type="video" 
                    onMediaCaptured={onMediaUploaded} 
                  />
                )}
              </div>
            </TabsContent>
          )}
          
          {allowedTypes.includes("audio") && (
            <TabsContent value="record" className="mt-0">
              <MediaCaptureButton 
                type="audio" 
                onMediaCaptured={onMediaUploaded} 
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
