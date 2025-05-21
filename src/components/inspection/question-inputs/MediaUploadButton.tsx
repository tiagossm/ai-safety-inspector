
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Paperclip, Mic, Video } from "lucide-react";

type MediaType = "photo" | "video" | "audio" | "file";

interface MediaUploadButtonProps {
  type: MediaType;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function MediaUploadButton({
  type,
  onClick,
  disabled = false,
  className = "",
}: MediaUploadButtonProps) {
  const getIcon = () => {
    switch (type) {
      case "photo":
        return <Camera className="h-4 w-4 mr-2" />;
      case "video":
        return <Video className="h-4 w-4 mr-2" />;
      case "audio":
        return <Mic className="h-4 w-4 mr-2" />;
      case "file":
        return <Paperclip className="h-4 w-4 mr-2" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case "photo":
        return "Foto";
      case "video":
        return "Vídeo";
      case "audio":
        return "Áudio";
      case "file":
        return "Arquivo";
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center ${className}`}
    >
      {getIcon()}
      {getLabel()}
    </Button>
  );
}
