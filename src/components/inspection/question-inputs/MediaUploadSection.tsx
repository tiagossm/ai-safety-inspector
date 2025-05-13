
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, FileText, ScanSearch, Sparkles, Loader2 } from "lucide-react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { MediaAttachments } from "./MediaAttachments";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

interface MediaUploadSectionProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  questionId: string;
  inspectionId?: string;
  isReadOnly?: boolean;
  questionText?: string;
  onSaveAnalysis?: (url: string, result: MediaAnalysisResult) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  analysisResults?: Record<string, MediaAnalysisResult>;
  onAnalyzeAll?: () => Promise<void>;
  multiModalLoading?: boolean;
}

export function MediaUploadSection({
  mediaUrls = [],
  onMediaChange,
  questionId,
  inspectionId,
  isReadOnly = false,
  questionText,
  onSaveAnalysis,
  onApplyAISuggestion,
  analysisResults = {},
  onAnalyzeAll,
  multiModalLoading = false
}: MediaUploadSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { uploadMedia, uploading, previewUrl, openMediaPreview, openMediaAnalysis } = useMediaUpload({
    questionId,
    inspectionId,
    onUploadComplete: (uploadedUrl) => {
      if (uploadedUrl) {
        const updatedMediaUrls = [...mediaUrls, uploadedUrl];
        onMediaChange(updatedMediaUrls);
      }
    }
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("Arquivo muito grande. Tamanho máximo: 50MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file type
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const acceptedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];
    
    const acceptedTypes = [...acceptedImageTypes, ...acceptedVideoTypes, ...acceptedAudioTypes];
    
    if (!acceptedTypes.includes(file.type)) {
      setError("Tipo de arquivo não suportado. Aceitos: JPG, PNG, GIF, MP4, WebM, MP3, WAV");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    try {
      await uploadMedia(file);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Erro ao enviar arquivo. Tente novamente.");
    }
  }, [uploadMedia]);

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    const updatedMediaUrls = mediaUrls.filter(url => url !== urlToDelete);
    onMediaChange(updatedMediaUrls);
  }, [mediaUrls, onMediaChange]);

  const handleOpenPreview = useCallback((url: string) => {
    openMediaPreview(url);
  }, [openMediaPreview]);

  const handleOpenAnalysis = useCallback((url: string, questionText?: string) => {
    openMediaAnalysis(url, questionText);
  }, [openMediaAnalysis]);

  return (
    <div>
      {!isReadOnly && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Image className="h-4 w-4" />
                  <span>Adicionar mídia</span>
                </>
              )}
            </Button>
            
            {mediaUrls.length > 1 && onAnalyzeAll && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onAnalyzeAll}
                className="gap-1"
                disabled={multiModalLoading}
              >
                {multiModalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Analisar todas</span>
                  </>
                )}
              </Button>
            )}
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      )}
      
      <MediaAttachments
        mediaUrls={mediaUrls}
        onDelete={isReadOnly ? undefined : handleDeleteMedia}
        onOpenPreview={handleOpenPreview}
        onOpenAnalysis={handleOpenAnalysis}
        readOnly={isReadOnly}
        questionText={questionText}
        onSaveAnalysis={onSaveAnalysis}
        onApplyAISuggestion={onApplyAISuggestion}
        analysisResults={analysisResults}
      />
    </div>
  );
}
