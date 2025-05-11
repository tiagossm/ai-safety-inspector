import React from "react";
import { Play, File, FileText, FileImage, FileVideo, FileAudio, X, ZoomIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Base interface for all media renderers
interface BaseMediaRendererProps {
  url: string;
  index: number;
  fileName: string;
  readOnly: boolean;
  smallSize?: boolean;
}

interface MediaWithPreviewProps extends BaseMediaRendererProps {
  onOpenPreview: (url: string) => void;
}

interface MediaWithAnalysisProps extends MediaWithPreviewProps {
  onOpenAnalysis: (url: string) => void;
  hasAnalysis?: boolean;
  questionText?: string;
}

interface MediaWithDeleteProps extends BaseMediaRendererProps {
  onDelete?: (url: string) => void;
}

export interface ImageRendererProps extends MediaWithAnalysisProps, MediaWithDeleteProps {}

export function ImageRenderer({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete,
  hasAnalysis,
  questionText,
  smallSize = false
}: ImageRendererProps) {
  return (
    <div className="relative w-full h-full group">
      <img
        src={url}
        alt={`Attachment ${index + 1}`}
        className="w-full h-full object-cover rounded-md cursor-pointer"
        style={{ maxHeight: smallSize ? '120px' : '200px', minHeight: '80px' }}
      />
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute top-1 right-1 flex gap-1">
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex-grow flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white p-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(url);
            }}
          >
            <ZoomIn className="h-4 w-4 text-gray-800" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "h-8 w-8 rounded-full p-0",
              hasAnalysis ? "bg-amber-400 hover:bg-amber-500" : "bg-white/80 hover:bg-white"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onOpenAnalysis(url);
            }}
          >
            <Sparkles className={cn("h-4 w-4", hasAnalysis ? "text-white" : "text-gray-800")} />
          </Button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
          <p className="text-xs text-white truncate">
            {fileName}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface VideoRendererProps extends MediaWithAnalysisProps, MediaWithDeleteProps {}

export function VideoRenderer({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete,
  hasAnalysis,
  questionText,
  smallSize = false
}: VideoRendererProps) {
  return (
    <div className="relative w-full h-full group">
      <div className="w-full h-full bg-black/10 rounded-md flex items-center justify-center"
        style={{ minHeight: smallSize ? '100px' : '150px', maxHeight: smallSize ? '120px' : '200px' }}>
        <FileVideo className="h-8 w-8 text-blue-500" />
      </div>
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute top-1 right-1 flex gap-1">
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex-grow flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white p-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(url);
            }}
          >
            <Play className="h-4 w-4 text-gray-800" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "h-8 w-8 rounded-full p-0",
              hasAnalysis ? "bg-amber-400 hover:bg-amber-500" : "bg-white/80 hover:bg-white"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onOpenAnalysis(url);
            }}
          >
            <Sparkles className={cn("h-4 w-4", hasAnalysis ? "text-white" : "text-gray-800")} />
          </Button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
          <p className="text-xs text-white truncate">
            {fileName}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface AudioRendererProps extends MediaWithAnalysisProps, MediaWithDeleteProps {
  onDownload: (url: string, fileName: string) => void;
}

export function AudioRenderer({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete,
  onDownload,
  hasAnalysis,
  questionText,
  smallSize = false
}: AudioRendererProps) {
  return (
    <div className="relative w-full h-full group">
      <div className="w-full h-full bg-black/10 rounded-md flex items-center justify-center"
        style={{ minHeight: smallSize ? '100px' : '150px', maxHeight: smallSize ? '120px' : '200px' }}>
        <FileAudio className="h-8 w-8 text-green-500" />
      </div>
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute top-1 right-1 flex gap-1">
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex-grow flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white p-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(url);
            }}
          >
            <Play className="h-4 w-4 text-gray-800" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "h-8 w-8 rounded-full p-0",
              hasAnalysis ? "bg-amber-400 hover:bg-amber-500" : "bg-white/80 hover:bg-white"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onOpenAnalysis(url);
            }}
          >
            <Sparkles className={cn("h-4 w-4", hasAnalysis ? "text-white" : "text-gray-800")} />
          </Button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
          <p className="text-xs text-white truncate">
            {fileName}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface DocumentRendererProps extends MediaWithPreviewProps, MediaWithDeleteProps {
  specificFileType?: string;
}

export function DocumentRenderer({
  url,
  index,
  fileName,
  onOpenPreview,
  readOnly,
  onDelete,
  specificFileType,
  smallSize = false
}: DocumentRendererProps) {
  return (
    <div className="relative w-full h-full group">
      <div className="w-full h-full bg-black/10 rounded-md flex items-center justify-center"
        style={{ minHeight: smallSize ? '100px' : '150px', maxHeight: smallSize ? '120px' : '200px' }}>
        <FileText className="h-8 w-8 text-red-500" />
      </div>
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute top-1 right-1 flex gap-1">
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex-grow flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white p-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(url);
            }}
          >
            <ZoomIn className="h-4 w-4 text-gray-800" />
          </Button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
          <p className="text-xs text-white truncate">
            {fileName}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface GenericFileRendererProps extends BaseMediaRendererProps, MediaWithDeleteProps {
  specificFileType?: string;
  onDownload: (url: string, fileName: string) => void;
}

export function GenericFileRenderer({
  url,
  index,
  fileName,
  specificFileType,
  onDownload,
  readOnly,
  onDelete,
  smallSize = false
}: GenericFileRendererProps) {
  return (
    <div className="relative w-full h-full group">
      <div className="w-full h-full bg-black/10 rounded-md flex flex-col items-center justify-center p-2"
        style={{ minHeight: smallSize ? '100px' : '150px', maxHeight: smallSize ? '120px' : '200px' }}>
        <File className="h-8 w-8 text-gray-500 mb-2" />
        <p className="text-xs text-center text-gray-800 line-clamp-2">
          {fileName}
        </p>
      </div>
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute top-1 right-1 flex gap-1">
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex-grow flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(url, fileName);
            }}
          >
            <ZoomIn className="h-4 w-4 text-gray-800" />
          </Button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
          <p className="text-xs text-white truncate">
            {fileName}
          </p>
        </div>
      </div>
    </div>
  );
}
