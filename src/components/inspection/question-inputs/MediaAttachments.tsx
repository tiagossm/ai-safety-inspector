
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileIcon, getFileType } from "@/utils/fileUtils";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (url: string) => void;
  readOnly?: boolean;
}

export function MediaAttachments({ mediaUrls, onDelete, readOnly = false }: MediaAttachmentsProps) {
  const renderAttachment = (url: string, index: number) => {
    const fileType = getFileType(url);
    const FileIcon = getFileIcon(fileType);
    
    // Get just the filename from the URL
    const fileName = url.split('/').pop() || 'arquivo';
    
    // Handle images
    if (fileType === 'image') {
      return (
        <div key={index} className="relative group">
          <div className="border rounded-md overflow-hidden">
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
              onClick={() => onDelete(url)}
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
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium truncate flex-1 hover:underline"
          >
            {fileName}
          </a>
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
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {mediaUrls.map((url, index) => renderAttachment(url, index))}
    </div>
  );
}
