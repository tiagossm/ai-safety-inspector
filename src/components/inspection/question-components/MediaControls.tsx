
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, Mic, File, Upload } from 'lucide-react';

interface MediaControlsProps {
  onPhotoClick?: () => void;
  onVideoClick?: () => void;
  onAudioClick?: () => void;
  onFileClick?: () => void;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  disabled?: boolean;
}

export function MediaControls({
  onPhotoClick,
  onVideoClick,
  onAudioClick,
  onFileClick,
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = true,
  disabled = false
}: MediaControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {allowsPhoto && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPhotoClick}
          disabled={disabled}
          className="flex items-center"
        >
          <Camera className="h-4 w-4 mr-2" />
          <span>Photo</span>
        </Button>
      )}
      
      {allowsVideo && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onVideoClick}
          disabled={disabled}
          className="flex items-center"
        >
          <Video className="h-4 w-4 mr-2" />
          <span>Video</span>
        </Button>
      )}
      
      {allowsAudio && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAudioClick}
          disabled={disabled}
          className="flex items-center"
        >
          <Mic className="h-4 w-4 mr-2" />
          <span>Audio</span>
        </Button>
      )}
      
      {allowsFiles && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFileClick}
          disabled={disabled}
          className="flex items-center"
        >
          <File className="h-4 w-4 mr-2" />
          <span>File</span>
        </Button>
      )}
    </div>
  );
}
