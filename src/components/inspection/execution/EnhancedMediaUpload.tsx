
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, Mic, File, Upload, X, Maximize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface EnhancedMediaUploadProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  onMediaUpload?: (file: File) => Promise<string | null>;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  disabled?: boolean;
}

export function EnhancedMediaUpload({
  mediaUrls = [],
  onMediaChange,
  onMediaUpload,
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = true,
  disabled = false
}: EnhancedMediaUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };
  
  const handleDragLeave = () => {
    setDragOver(false);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };
  
  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await uploadFile(e.target.files[0]);
      e.target.value = ""; // Reset input value for reuse
    }
  };
  
  // Upload file
  const uploadFile = async (file: File) => {
    if (disabled) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Fake progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      let url: string | null = null;
      
      if (onMediaUpload) {
        url = await onMediaUpload(file);
      } else {
        // Simulate upload if no function provided
        await new Promise(resolve => setTimeout(resolve, 1500));
        url = URL.createObjectURL(file);
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (url) {
        onMediaChange([...mediaUrls, url]);
        toast.success("Arquivo enviado com sucesso!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao enviar arquivo.");
    } finally {
      setUploading(false);
    }
  };
  
  // Delete media
  const handleDeleteMedia = (urlToDelete: string) => {
    const updatedUrls = mediaUrls.filter(url => url !== urlToDelete);
    onMediaChange(updatedUrls);
    toast.success("Anexo removido.");
  };
  
  // Open media preview
  const handleOpenPreview = (url: string) => {
    setPreviewUrl(url);
    setShowMediaPreview(true);
  };
  
  // Get media type from URL
  const getMediaType = (url: string) => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
    const videoExtensions = /\.(mp4|webm|ogg|mov)$/i;
    const audioExtensions = /\.(mp3|wav|ogg|m4a)$/i;
    
    if (imageExtensions.test(url)) return "image";
    if (videoExtensions.test(url)) return "video";
    if (audioExtensions.test(url)) return "audio";
    return "file";
  };
  
  // Get file icon based on extension
  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase() || "";
    
    const iconClasses = "h-6 w-6 mx-auto";
    
    switch (extension) {
      case 'pdf':
        return <File className={`${iconClasses} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <File className={`${iconClasses} text-blue-500`} />;
      case 'xls':
      case 'xlsx':
        return <File className={`${iconClasses} text-green-500`} />;
      case 'ppt':
      case 'pptx':
        return <File className={`${iconClasses} text-orange-500`} />;
      default:
        return <File className={`${iconClasses} text-gray-500`} />;
    }
  };
  
  const mediaTypes = {
    image: { icon: <Camera size={16} />, label: "Foto" },
    video: { icon: <Video size={16} />, label: "Vídeo" },
    audio: { icon: <Mic size={16} />, label: "Áudio" },
    file: { icon: <File size={16} />, label: "Arquivo" },
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Get file name from URL
  const getFileName = (url: string) => {
    try {
      return url.split('/').pop() || "Arquivo";
    } catch (e) {
      return "Arquivo";
    }
  };
  
  return (
    <div className={`mt-3 ${disabled ? 'opacity-75' : ''}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />
      
      {/* Drag and drop area */}
      {!disabled && (
        <div 
          className={`border border-dashed rounded-md py-3 px-4 transition-colors cursor-pointer ${
            dragOver ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center text-sm text-muted-foreground">
            <Upload className="h-5 w-5 mb-1" />
            <p>Arraste arquivos ou clique para anexar</p>
            
            {/* Media type badges */}
            <div className="flex flex-wrap gap-1 mt-1 justify-center">
              {allowsPhoto && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-flex items-center">
                  <Camera size={12} className="mr-1" />
                  Foto
                </span>
              )}
              {allowsVideo && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full inline-flex items-center">
                  <Video size={12} className="mr-1" />
                  Vídeo
                </span>
              )}
              {allowsAudio && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full inline-flex items-center">
                  <Mic size={12} className="mr-1" />
                  Áudio
                </span>
              )}
              {allowsFiles && (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full inline-flex items-center">
                  <File size={12} className="mr-1" />
                  Arquivo
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Upload progress */}
      {uploading && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Enviando...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}
      
      {/* Media previews */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-3">
          {mediaUrls.map((url, index) => {
            const mediaType = getMediaType(url);
            
            return (
              <div key={index} className="group relative bg-gray-50 border rounded-md overflow-hidden aspect-square">
                {/* Media preview */}
                {mediaType === "image" ? (
                  <img 
                    src={url} 
                    alt={`Anexo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onClick={() => handleOpenPreview(url)}
                  />
                ) : (
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center p-2"
                    onClick={() => handleOpenPreview(url)}
                  >
                    {getFileIcon(url)}
                    <span className="text-xs text-center mt-1 truncate w-full">
                      {getFileName(url)}
                    </span>
                  </div>
                )}
                
                {/* Media type indicator */}
                <div className="absolute top-1 left-1 bg-black/50 text-white rounded-md px-1 py-0.5 text-xs flex items-center">
                  {mediaTypes[mediaType].icon}
                </div>
                
                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-white/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview(url);
                      }}
                    >
                      <Maximize2 size={12} />
                    </Button>
                    {!disabled && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMedia(url);
                        }}
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Media preview dialog */}
      <Dialog open={showMediaPreview} onOpenChange={setShowMediaPreview}>
        <DialogContent className="max-w-4xl">
          <div className="w-full max-h-[70vh] overflow-auto p-2 flex items-center justify-center">
            {previewUrl && getMediaType(previewUrl) === "image" ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain"
              />
            ) : previewUrl && getMediaType(previewUrl) === "video" ? (
              <video 
                src={previewUrl} 
                controls 
                className="max-w-full max-h-full"
              />
            ) : previewUrl && getMediaType(previewUrl) === "audio" ? (
              <audio 
                src={previewUrl} 
                controls 
                className="w-full" 
              />
            ) : (
              <div className="text-center">
                <File className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Abrir arquivo
                  </a>
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
