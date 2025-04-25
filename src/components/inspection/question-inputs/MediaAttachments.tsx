
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileIcon, ImageIcon, FileAudio, FileVideo, Trash2, ExternalLink } from "lucide-react";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete: (url: string) => void;
}

export function MediaAttachments({ mediaUrls, onDelete }: MediaAttachmentsProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Function to detect media type from URL or file extension
  const getMediaType = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    
    if (!extension) return "file";
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return "image";
    } else if (['mp4', 'webm', 'mov'].includes(extension)) {
      return "video";
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return "audio";
    } else {
      return "file";
    }
  };
  
  // Function to get appropriate icon based on media type
  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <FileVideo className="h-4 w-4" />;
      case "audio":
        return <FileAudio className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };
  
  // Function to get file name from URL
  const getFileName = (url: string) => {
    try {
      // Try to extract filename from the last part of the URL path
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];
      
      // Remove any query params or decode URI component if needed
      return decodeURIComponent(fileName.split("?")[0]);
    } catch (e) {
      // If URL parsing fails, try to get last segment after '/'
      const parts = url.split("/");
      return parts[parts.length - 1];
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {mediaUrls.map((url, index) => {
          const mediaType = getMediaType(url);
          const icon = getMediaIcon(mediaType);
          const fileName = getFileName(url);
          
          return (
            <Card 
              key={index} 
              className="p-2 relative group cursor-pointer"
              onClick={() => setPreviewUrl(url)}
            >
              <div className="flex items-center">
                {mediaType === "image" ? (
                  <div className="w-8 h-8 mr-2 bg-muted rounded flex items-center justify-center overflow-hidden">
                    <img 
                      src={url} 
                      alt={fileName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 mr-2 bg-muted rounded flex items-center justify-center">
                    {icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" title={fileName}>
                    {fileName}
                  </p>
                </div>
              </div>
              
              {/* Delete button that appears on hover */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(url);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              {/* External link button */}
              <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(url, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Media preview dialog */}
      <Dialog 
        open={!!previewUrl} 
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent className="sm:max-w-xl">
          {previewUrl && (
            <div className="flex items-center justify-center">
              {getMediaType(previewUrl) === "image" ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : getMediaType(previewUrl) === "video" ? (
                <video 
                  src={previewUrl} 
                  controls 
                  className="max-w-full max-h-[70vh]"
                />
              ) : getMediaType(previewUrl) === "audio" ? (
                <audio 
                  src={previewUrl} 
                  controls 
                  className="w-full"
                />
              ) : (
                <div className="text-center">
                  <FileIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>{getFileName(previewUrl)}</p>
                  <Button
                    className="mt-4"
                    onClick={() => window.open(previewUrl, '_blank')}
                  >
                    Baixar arquivo
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
