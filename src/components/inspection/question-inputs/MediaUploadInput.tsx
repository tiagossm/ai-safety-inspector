
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Pencil, Trash2, Search, Play, FileText, Mic, FileVideo, Image, Sparkles } from "lucide-react";
import { PhotoInput } from "./PhotoInput";
import { MediaDialog } from "../dialogs/MediaDialog";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { getFileType } from "@/utils/fileUtils";

interface MediaUploadInputProps {
  mediaUrls: string[];
  onMediaChange: (mediaUrls: string[]) => void;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  readOnly?: boolean;
}

export function MediaUploadInput({
  mediaUrls = [],
  onMediaChange,
  allowsPhoto = true,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  readOnly = false
}: MediaUploadInputProps) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);
  
  const handleAddMedia = () => {
    if (!readOnly) {
      setMediaDialogOpen(true);
    }
  };
  
  const handleMediaUploaded = (urls: string[]) => {
    const newUrls = [...mediaUrls, ...urls];
    onMediaChange(newUrls);
  };
  
  const handleDeleteMedia = (urlToDelete: string) => {
    if (!readOnly) {
      const filteredUrls = mediaUrls.filter(url => url !== urlToDelete);
      onMediaChange(filteredUrls);
    }
  };
  
  const handlePreviewMedia = (url: string) => {
    setSelectedMedia(url);
    setPreviewDialogOpen(true);
  };
  
  const handleAnalyzeMedia = (url: string, type: string) => {
    setSelectedMedia(url);
    setSelectedMediaType(type);
    setAnalysisDialogOpen(true);
  };

  const getMediaType = (url: string): string => {
    if (url.match(/\.(jpe?g|png|gif|bmp|webp)$/i)) return 'image/jpeg';
    if (url.match(/\.(mp4|webm|mov)$/i)) return 'video/mp4';
    if (url.match(/\.(mp3|wav|ogg)$/i)) return 'audio/mp3';
    return 'application/octet-stream';
  };
  
  const getMediaIcon = (url: string) => {
    if (url.match(/\.(jpe?g|png|gif|bmp|webp)$/i)) return <Image className="h-4 w-4" />;
    if (url.match(/\.(mp4|webm|mov)$/i)) return <FileVideo className="h-4 w-4" />;
    if (url.match(/\.(mp3|wav|ogg)$/i)) return <Mic className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const allowedTypes = [];
  if (allowsPhoto) allowedTypes.push('image/*');
  if (allowsVideo) allowedTypes.push('video/*');
  if (allowsAudio) allowedTypes.push('audio/*');
  if (allowsFiles) allowedTypes.push('*/*');
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {!readOnly && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddMedia}
            className="text-xs flex items-center gap-1"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Adicionar mídia</span>
          </Button>
        )}
        
        {mediaUrls.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {mediaUrls.length} {mediaUrls.length === 1 ? 'arquivo' : 'arquivos'}
          </span>
        )}
      </div>
      
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {mediaUrls.map((url, index) => (
            <div 
              key={index}
              className="group relative border rounded-md overflow-hidden bg-muted/20"
            >
              {url.match(/\.(jpe?g|png|gif|bmp|webp)$/i) ? (
                <div className="aspect-square">
                  <img 
                    src={url} 
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : url.match(/\.(mp4|webm|mov)$/i) ? (
                <div className="aspect-square bg-black flex items-center justify-center">
                  <Play className="h-8 w-8 text-white opacity-80" />
                </div>
              ) : url.match(/\.(mp3|wav|ogg)$/i) ? (
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <Mic className="h-8 w-8 text-blue-400" />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {/* Overlay com botões */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={() => handlePreviewMedia(url)}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={() => handleAnalyzeMedia(url, getMediaType(url))}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </Button>
                  
                  {!readOnly && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => handleDeleteMedia(url)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Ícone indicativo do tipo de arquivo */}
              <div className="absolute bottom-1 left-1 bg-white bg-opacity-80 rounded-full p-1">
                {getMediaIcon(url)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <MediaDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onMediaUploaded={handleMediaUploaded}
        response={{ mediaUrls }}
        allowedTypes={allowedTypes}
      />
      
      <MediaPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        url={selectedMedia}
      />

      <MediaAnalysisDialog
        open={analysisDialogOpen}
        onOpenChange={setAnalysisDialogOpen}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
      />
    </div>
  );
}
