
import React from "react";
import { PlayCircle, FileText, FileSpreadsheet, FileCode, Archive, Presentation, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFilenameFromUrl } from "@/utils/fileUtils";

interface ImageRendererProps {
  url: string;
  index: number;
  fileName: string;
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string) => void;
  readOnly: boolean;
  onDelete?: (url: string) => void;
}

export const ImageRenderer = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete
}: ImageRendererProps) => (
  <div key={index} className="relative group">
    <div 
      className="border rounded-md overflow-hidden cursor-pointer" 
      onClick={() => onOpenPreview(url)}
    >
      <img 
        src={url} 
        alt={`Anexo ${index + 1}`} 
        className="h-40 w-full object-cover"
        onError={(e) => {
          console.error(`Error loading image: ${url}`);
          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEyIDIyYzUuNTIzIDAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTB6IiBzdHJva2U9IiNBM0IzQkMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEyIDhhMSAxIDAgMTEwLTIgMSAxIDAgMDEwIDJ6bTAgOHYtNmguMDFIOFYxMGg0LjAxSDEzIiBzdHJva2U9IiNBM0IzQkMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+';
        }}
      />
    </div>
    <div className="absolute bottom-1 left-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="secondary"
        size="icon"
        className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
        onClick={(e) => {
          e.stopPropagation();
          onOpenAnalysis(url);
        }}
      >
        <div className="h-3 w-3 text-amber-500">✨</div>
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
        onClick={(e) => {
          e.stopPropagation();
          onOpenPreview(url);
        }}
      >
        <div className="h-3 w-3">🔍</div>
      </Button>
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
        <div className="h-4 w-4">✕</div>
      </Button>
    )}
    <div className="absolute bottom-1 right-1 bg-white/80 rounded-md px-2 py-1 text-xs">
      <span title={fileName} className="truncate max-w-[120px] inline-block">{fileName}</span>
    </div>
  </div>
);

interface AudioRendererProps {
  url: string;
  index: number;
  fileName: string;
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string) => void;
  readOnly: boolean;
  onDelete?: (url: string) => void;
  onDownload: (url: string, fileName: string) => void;
}

export const AudioRenderer = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete,
  onDownload
}: AudioRendererProps) => (
  <div key={index} className="relative group">
    <div className="border rounded-md p-3 flex items-center gap-3 bg-slate-50">
      <Mic className="h-6 w-6 text-primary" />
      <div className="flex-1 mr-2 overflow-hidden">
        <p className="text-sm font-medium truncate" title={fileName}>{fileName}</p>
        <div className="flex items-center mt-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 p-0 hover:bg-transparent"
            onClick={() => onOpenPreview(url)}
          >
            <PlayCircle className="h-6 w-6 text-primary" />
          </Button>
          <div className="h-1.5 flex-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-0"></div>
          </div>
          <span className="text-xs text-gray-500">0:00</span>
        </div>
      </div>
      <div className="flex">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAnalysis(url);
          }}
        >
          <div className="h-3 w-3 text-amber-500">✨</div>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onDownload(url, fileName)}
        >
          <div className="h-4 w-4">⬇️</div>
        </Button>
      </div>
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
        <div className="h-4 w-4">✕</div>
      </Button>
    )}
  </div>
);

interface VideoRendererProps {
  url: string;
  index: number;
  fileName: string;
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string) => void;
  readOnly: boolean;
  onDelete?: (url: string) => void;
}

export const VideoRenderer = ({
  url,
  index,
  fileName,
  onOpenPreview,
  onOpenAnalysis,
  readOnly,
  onDelete
}: VideoRendererProps) => (
  <div key={index} className="relative group">
    <div 
      className="border rounded-md overflow-hidden cursor-pointer bg-gray-100 h-40 flex items-center justify-center" 
      onClick={() => onOpenPreview(url)}
    >
      <PlayCircle className="h-12 w-12 text-primary opacity-80" />
    </div>
    <p className="text-xs font-medium mt-1 truncate" title={fileName}>{fileName}</p>
    <div className="absolute bottom-6 left-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="secondary"
        size="icon"
        className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
        onClick={(e) => {
          e.stopPropagation();
          onOpenAnalysis(url);
        }}
      >
        <div className="h-3 w-3 text-amber-500">✨</div>
      </Button>
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
        <div className="h-4 w-4">✕</div>
      </Button>
    )}
  </div>
);

interface DocumentRendererProps {
  url: string;
  index: number;
  fileName: string;
  onOpenPreview: (url: string) => void;
  readOnly: boolean;
  onDelete?: (url: string) => void;
  specificFileType: string;
}

export const DocumentRenderer = ({
  url,
  index,
  fileName,
  onOpenPreview,
  readOnly,
  onDelete,
  specificFileType
}: DocumentRendererProps) => (
  <div key={index} className="relative group">
    <div className="border rounded-md p-3 flex items-center gap-3">
      <FileText className="h-6 w-6 text-red-500" />
      <div className="flex-1">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium truncate flex-1 hover:underline"
          onClick={(e) => e.stopPropagation()}
          title={fileName}
        >
          {fileName}
        </a>
        <p className="text-xs text-gray-500">
          Documento PDF
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onOpenPreview(url)}
      >
        <div className="h-4 w-4">🔍</div>
      </Button>
    </div>
    {!readOnly && onDelete && (
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(url)}
      >
        <div className="h-4 w-4">✕</div>
      </Button>
    )}
  </div>
);

interface GenericFileRendererProps {
  url: string;
  index: number;
  fileName: string;
  specificFileType: string;
  onDownload: (url: string, fileName: string) => void;
  readOnly: boolean;
  onDelete?: (url: string) => void;
}

export const GenericFileRenderer = ({
  url,
  index,
  fileName,
  specificFileType,
  onDownload,
  readOnly,
  onDelete
}: GenericFileRendererProps) => (
  <div key={index} className="relative group">
    <div className="border rounded-md p-3 flex items-center gap-3">
      {specificFileType === 'excel' ? (
        <FileSpreadsheet className="h-6 w-6 text-green-600" />
      ) : specificFileType === 'word' ? (
        <FileText className="h-6 w-6 text-blue-600" />
      ) : specificFileType === 'code' ? (
        <FileCode className="h-6 w-6 text-purple-600" />
      ) : specificFileType === 'zip' ? (
        <Archive className="h-6 w-6 text-yellow-600" />
      ) : specificFileType === 'presentation' ? (
        <Presentation className="h-6 w-6 text-orange-600" />
      ) : (
        <FileText className="h-6 w-6 text-gray-600" />
      )}
      <div className="flex-1 overflow-hidden">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium truncate block hover:underline"
          onClick={(e) => e.stopPropagation()}
          title={fileName}
        >
          {fileName}
        </a>
        <p className="text-xs text-gray-500">
          {specificFileType === 'excel' ? 'Planilha Excel' :
           specificFileType === 'word' ? 'Documento Word' :
           specificFileType === 'code' ? 'Arquivo de Código' :
           specificFileType === 'zip' ? 'Arquivo Compactado' :
           specificFileType === 'presentation' ? 'Apresentação' :
           'Documento'}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onDownload(url, fileName)}
      >
        <div className="h-4 w-4">⬇️</div>
      </Button>
    </div>
    {!readOnly && onDelete && (
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(url)}
      >
        <div className="h-4 w-4">✕</div>
      </Button>
    )}
  </div>
);
