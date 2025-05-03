
import React, { useState } from "react";
import { X, ExternalLink, PlayCircle, PauseCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileIcon, getFileType } from "@/utils/fileUtils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (url: string) => void;
  readOnly?: boolean;
}

export function MediaAttachments({ mediaUrls, onDelete, readOnly = false }: MediaAttachmentsProps) {
  const [activeDialogUrl, setActiveDialogUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleOpenDialog = (url: string) => {
    setActiveDialogUrl(url);
  };

  const handleCloseDialog = () => {
    setActiveDialogUrl(null);
    setIsPlaying(false);
  };

  const toggleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const renderAttachment = (url: string, index: number) => {
    const fileType = getFileType(url);
    const FileIcon = getFileIcon(fileType);
    
    // Get just the filename from the URL
    const fileName = url.split('/').pop() || 'arquivo';
    
    // Handle images
    if (fileType === 'image') {
      return (
        <div key={index} className="relative group">
          <div 
            className="border rounded-md overflow-hidden cursor-pointer" 
            onClick={() => handleOpenDialog(url)}
          >
            <img 
              src={url} 
              alt={`Anexo ${index + 1}`} 
              className="h-40 w-full object-cover"
            />
          </div>
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleOpenDialog(url)}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    // Handle audio
    if (fileType === 'audio') {
      return (
        <div key={index} className="relative group">
          <div className="border rounded-md p-3 flex items-center gap-3 bg-slate-50">
            <FileIcon className="h-6 w-6 text-primary" />
            <div className="flex-1 mr-2 overflow-hidden">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <div className="flex items-center mt-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={toggleAudioPlay}
                >
                  {isPlaying ? (
                    <PauseCircle className="h-6 w-6 text-primary" />
                  ) : (
                    <PlayCircle className="h-6 w-6 text-primary" />
                  )}
                </Button>
                <div className="h-1.5 flex-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-0"></div>
                </div>
                <span className="text-xs text-gray-500">0:00</span>
              </div>
              {isPlaying && <audio src={url} autoPlay controls hidden />}
            </div>
          </div>
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
    
    // Handle video
    if (fileType === 'video') {
      return (
        <div key={index} className="relative group">
          <div 
            className="border rounded-md overflow-hidden cursor-pointer bg-gray-100 h-40 flex items-center justify-center" 
            onClick={() => handleOpenDialog(url)}
          >
            <PlayCircle className="h-12 w-12 text-primary opacity-80" />
          </div>
          <p className="text-xs font-medium mt-1 truncate">{fileName}</p>
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
    
    // Handle other file types
    return (
      <div key={index} className="relative group">
        <div className="border rounded-md p-3 flex items-center gap-3">
          <FileIcon className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium truncate flex-1 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {fileName}
            </a>
            <p className="text-xs text-gray-500">
              {fileType === 'pdf' ? 'PDF Document' :
                fileType === 'excel' ? 'Excel Spreadsheet' :
                fileType === 'word' ? 'Word Document' :
                fileType === 'code' ? 'Code File' :
                fileType === 'zip' ? 'Archive File' :
                'Document'}
            </p>
          </div>
        </div>
        {!readOnly && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(url)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  const renderMediaDialog = () => {
    if (!activeDialogUrl) return null;
    
    const fileType = getFileType(activeDialogUrl);
    const fileName = activeDialogUrl.split('/').pop() || 'arquivo';
    
    let content;
    
    if (fileType === 'image') {
      content = (
        <div className="flex justify-center">
          <img 
            src={activeDialogUrl} 
            alt={fileName} 
            className="max-h-[70vh] max-w-full object-contain"
          />
        </div>
      );
    } else if (fileType === 'video') {
      content = (
        <div className="flex justify-center">
          <video 
            src={activeDialogUrl} 
            controls 
            className="max-h-[70vh] max-w-full" 
            autoPlay
          />
        </div>
      );
    } else if (fileType === 'audio') {
      content = (
        <div className="flex justify-center p-4">
          <audio src={activeDialogUrl} controls autoPlay className="w-full" />
        </div>
      );
    } else {
      content = (
        <div className="flex flex-col items-center justify-center p-4">
          <FileText className="h-16 w-16 text-primary mb-4" />
          <p className="text-lg font-medium mb-2">File Preview Not Available</p>
          <p className="text-gray-500 mb-4">Please download the file to view it.</p>
          <Button asChild>
            <a 
              href={activeDialogUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open File
            </a>
          </Button>
        </div>
      );
    }
    
    return (
      <Dialog open={!!activeDialogUrl} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-center">
              {fileName}
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mediaUrls.map((url, index) => renderAttachment(url, index))}
      </div>
      {renderMediaDialog()}
    </>
  );
}
