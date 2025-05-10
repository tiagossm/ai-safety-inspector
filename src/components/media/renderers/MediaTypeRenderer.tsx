
import React from "react";
import { X, ZoomIn, Sparkles, Download, FileText, Image as ImageIcon, Video, Music, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BaseRendererProps {
  url: string;
  index: number;
  fileName: string;
  onDelete?: (url: string) => void;
  readOnly: boolean;
  hasAnalysis?: boolean;
  smallSize?: boolean;
}

interface MediaRendererProps extends BaseRendererProps {
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string) => void;
  questionText?: string;
}

interface DownloadableRendererProps extends BaseRendererProps {
  onDownload: (url: string, fileName: string) => void;
}

interface DocumentRendererProps extends BaseRendererProps {
  onOpenPreview: (url: string) => void;
  specificFileType: string;
}

interface GenericFileRendererProps extends DownloadableRendererProps {
  specificFileType: string;
}

export const ImageRenderer: React.FC<MediaRendererProps> = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  onDelete,
  readOnly,
  hasAnalysis,
  questionText,
  smallSize = false
}) => {
  return (
    <div className="relative group">
      <div 
        className={`border rounded-md overflow-hidden bg-gray-50 ${smallSize ? 'h-24' : 'h-36'} flex items-center justify-center`}
        onClick={() => onOpenPreview(url)}
      >
        <img
          src={url}
          alt={fileName}
          className="object-cover h-full w-full cursor-pointer"
        />
      </div>
      
      <div className="absolute top-1 right-1 flex gap-1">
        {!readOnly && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(url);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="absolute bottom-1 left-1 flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPreview(url);
          }}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAnalysis(url);
          }}
        >
          <Sparkles className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Indicator that this media has AI analysis */}
      {hasAnalysis && (
        <Badge 
          variant="outline" 
          className="absolute top-1 left-1 bg-amber-100 text-amber-800 border-amber-300 text-[9px] py-0 px-1 h-4"
        >
          <Sparkles className="h-2 w-2 mr-1" />
          Analisado
        </Badge>
      )}
    </div>
  );
};

export const VideoRenderer: React.FC<MediaRendererProps> = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  onDelete,
  readOnly,
  hasAnalysis,
  questionText,
  smallSize = false
}) => {
  return (
    <div className="relative group">
      <div 
        className={`border rounded-md overflow-hidden bg-gray-50 ${smallSize ? 'h-24' : 'h-36'} flex flex-col items-center justify-center p-2`}
        onClick={() => onOpenPreview(url)}
      >
        <Video className="h-8 w-8 text-gray-400 mb-1" />
        <p className="text-xs text-gray-600 text-center truncate w-full">{fileName}</p>
      </div>
      
      <div className="absolute top-1 right-1 flex gap-1">
        {!readOnly && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(url);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="absolute bottom-1 left-1 flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPreview(url);
          }}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAnalysis(url);
          }}
        >
          <Sparkles className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Indicator that this media has AI analysis */}
      {hasAnalysis && (
        <Badge 
          variant="outline" 
          className="absolute top-1 left-1 bg-amber-100 text-amber-800 border-amber-300 text-[9px] py-0 px-1 h-4"
        >
          <Sparkles className="h-2 w-2 mr-1" />
          Analisado
        </Badge>
      )}
    </div>
  );
};

export const AudioRenderer: React.FC<MediaRendererProps & DownloadableRendererProps> = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  onDelete,
  onDownload,
  readOnly,
  hasAnalysis,
  questionText,
  smallSize = false
}) => {
  return (
    <div className="relative group">
      <div 
        className={`border rounded-md overflow-hidden bg-gray-50 ${smallSize ? 'h-24' : 'h-36'} flex flex-col items-center justify-center p-2`}
        onClick={() => onOpenPreview(url)}
      >
        <Music className="h-8 w-8 text-gray-400 mb-1" />
        <p className="text-xs text-gray-600 text-center truncate w-full">{fileName}</p>
      </div>
      
      <div className="absolute top-1 right-1 flex gap-1">
        {!readOnly && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(url);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="absolute bottom-1 left-1 flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPreview(url);
          }}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAnalysis(url);
          }}
        >
          <Sparkles className="h-3 w-3" />
        </Button>
        
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(url, fileName);
          }}
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Indicator that this media has AI analysis */}
      {hasAnalysis && (
        <Badge 
          variant="outline" 
          className="absolute top-1 left-1 bg-amber-100 text-amber-800 border-amber-300 text-[9px] py-0 px-1 h-4"
        >
          <Sparkles className="h-2 w-2 mr-1" />
          Analisado
        </Badge>
      )}
    </div>
  );
};

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onDelete,
  readOnly,
  specificFileType,
  smallSize = false
}) => {
  return (
    <div className="relative group">
      <div 
        className={`border rounded-md overflow-hidden bg-gray-50 ${smallSize ? 'h-24' : 'h-36'} flex flex-col items-center justify-center p-2`}
        onClick={() => onOpenPreview(url)}
      >
        <FileText className="h-8 w-8 text-gray-400 mb-1" />
        <p className="text-xs text-gray-600 text-center truncate w-full">{fileName}</p>
      </div>
      
      <div className="absolute top-1 right-1 flex gap-1">
        {!readOnly && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(url);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="absolute bottom-1 left-1 flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPreview(url);
          }}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export const GenericFileRenderer: React.FC<GenericFileRendererProps> = ({
  url,
  index,
  fileName,
  specificFileType,
  onDownload,
  onDelete,
  readOnly,
  smallSize = false
}) => {
  return (
    <div className="relative group">
      <div 
        className={`border rounded-md overflow-hidden bg-gray-50 ${smallSize ? 'h-24' : 'h-36'} flex flex-col items-center justify-center p-2`}
        onClick={() => onDownload(url, fileName)}
      >
        <File className="h-8 w-8 text-gray-400 mb-1" />
        <p className="text-xs text-gray-600 text-center truncate w-full">{fileName}</p>
      </div>
      
      <div className="absolute top-1 right-1 flex gap-1">
        {!readOnly && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(url);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="absolute bottom-1 left-1 flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(url, fileName);
          }}
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
