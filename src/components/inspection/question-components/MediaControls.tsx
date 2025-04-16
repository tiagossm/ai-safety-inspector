
import { Button } from "@/components/ui/button";
import { Camera, Mic, File, Video } from "lucide-react";

interface MediaControlsProps {
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsFiles: boolean;
  handleAddMedia: () => void;
}

export function MediaControls({
  allowsPhoto,
  allowsVideo,
  allowsAudio,
  allowsFiles,
  handleAddMedia
}: MediaControlsProps) {
  // If no media types are allowed, don't render anything
  if (!allowsPhoto && !allowsVideo && !allowsAudio && !allowsFiles) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {allowsPhoto && (
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddMedia}
          className="flex items-center"
        >
          <Camera className="h-4 w-4 mr-1" />
          Foto
        </Button>
      )}
      
      {allowsVideo && (
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddMedia}
          className="flex items-center"
        >
          <Video className="h-4 w-4 mr-1" />
          Vídeo
        </Button>
      )}
      
      {allowsAudio && (
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddMedia}
          className="flex items-center"
        >
          <Mic className="h-4 w-4 mr-1" />
          Áudio
        </Button>
      )}
      
      {allowsFiles && (
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddMedia}
          className="flex items-center"
        >
          <File className="h-4 w-4 mr-1" />
          Arquivo
        </Button>
      )}
    </div>
  );
}
