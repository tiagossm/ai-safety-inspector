
import React from "react";
import { Camera, FileText, File, X, ZoomIn, Download, PlayCircle, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MediaRendererProps {
  url: string;
  index: number;
  fileName: string;
  onOpenPreview?: (url: string) => void;
  onOpenAnalysis?: (url: string) => void;
  readOnly: boolean;
  onDelete?: (url: string) => void;
  hasAnalysis?: boolean;
  questionText?: string;
}

interface DocumentRendererProps extends MediaRendererProps {
  specificFileType: string;
}

interface GenericFileRendererProps {
  url: string;
  index: number;
  fileName: string;
  specificFileType: string;
  onDownload: (url: string, fileName: string) => void;
  readOnly: boolean;
  onDelete?: (url: string) => void;
}

interface AudioRendererProps extends MediaRendererProps {
  onDownload: (url: string, fileName: string) => void;
}

export const ImageRenderer: React.FC<MediaRendererProps> = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete,
  hasAnalysis,
  questionText
}) => {
  return (
    <div className="relative group border rounded-md overflow-hidden bg-gray-50">
      <div className="relative aspect-square">
        <img
          src={url}
          alt={fileName || `Imagem ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {hasAnalysis && (
          <div className="absolute top-1 left-1 z-10">
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-1.5 flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span className="text-xs">Analisado</span>
            </Badge>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {onOpenPreview && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenPreview(url)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}
        
        {onOpenAnalysis && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={hasAnalysis ? "secondary" : "default"}
                  size="icon"
                  className={`h-8 w-8 ${hasAnalysis ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' : ''}`}
                  onClick={() => onOpenAnalysis(url)}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasAnalysis ? 'Ver análise' : 'Analisar com IA'}
                {questionText && hasAnalysis && <div className="text-xs mt-1">Analisado com contexto da pergunta</div>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {!readOnly && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(url)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const AudioRenderer: React.FC<AudioRendererProps> = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete,
  onDownload,
  hasAnalysis,
  questionText
}) => {
  return (
    <div className="relative group border rounded-md overflow-hidden bg-gray-50">
      <div className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1 text-sm font-medium mb-2 truncate">
            <PlayCircle className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate">{fileName || `Áudio ${index + 1}`}</span>
          </div>
          {hasAnalysis && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-1.5 flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span className="text-xs">Analisado</span>
            </Badge>
          )}
        </div>
        
        <div className="pt-2">
          <audio src={url} controls className="w-full h-8" />
        </div>
      </div>
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {onOpenPreview && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenPreview(url)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}
        
        {onOpenAnalysis && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={hasAnalysis ? "secondary" : "default"}
                  size="icon"
                  className={`h-8 w-8 ${hasAnalysis ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' : ''}`}
                  onClick={() => onOpenAnalysis(url)}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasAnalysis ? 'Ver análise' : 'Analisar com IA'}
                {questionText && hasAnalysis && <div className="text-xs mt-1">Analisado com contexto da pergunta</div>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDownload(url, fileName || `audio-${index + 1}.webm`)}
        >
          <Download className="h-4 w-4" />
        </Button>
        
        {!readOnly && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(url)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const VideoRenderer: React.FC<MediaRendererProps> = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete,
  hasAnalysis,
  questionText
}) => {
  return (
    <div className="relative group border rounded-md overflow-hidden bg-gray-50">
      <div className="relative aspect-video">
        <video
          src={url}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="h-12 w-12 text-white opacity-70" />
        </div>
        {hasAnalysis && (
          <div className="absolute top-1 left-1 z-10">
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-1.5 flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span className="text-xs">Analisado</span>
            </Badge>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {onOpenPreview && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenPreview(url)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}
        
        {onOpenAnalysis && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={hasAnalysis ? "secondary" : "default"}
                  size="icon"
                  className={`h-8 w-8 ${hasAnalysis ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' : ''}`}
                  onClick={() => onOpenAnalysis(url)}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasAnalysis ? 'Ver análise' : 'Analisar com IA'}
                {questionText && hasAnalysis && <div className="text-xs mt-1">Analisado com contexto da pergunta</div>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {!readOnly && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(url)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  url,
  index,
  fileName,
  onOpenPreview,
  readOnly,
  onDelete,
  specificFileType
}) => {
  return (
    <div className="relative group border rounded-md overflow-hidden bg-gray-50">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium truncate">
            {fileName || `Documento ${index + 1}`}
          </span>
        </div>
        
        <div className="text-center py-6">
          <FileText className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <div className="text-xs font-medium mb-1">
            {specificFileType.toUpperCase()}
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {onOpenPreview && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenPreview(url)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}
        
        {!readOnly && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(url)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
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
  readOnly,
  onDelete
}) => {
  return (
    <div className="relative group border rounded-md overflow-hidden bg-gray-50">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <File className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium truncate">
            {fileName || `Arquivo ${index + 1}`}
          </span>
        </div>
        
        <div className="text-center py-6">
          <File className="h-12 w-12 text-blue-400 mx-auto mb-2" />
          <div className="text-xs font-medium uppercase">
            {specificFileType}
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDownload(url, fileName || `file-${index + 1}`)}
        >
          <Download className="h-4 w-4" />
        </Button>
        
        {!readOnly && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(url)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
