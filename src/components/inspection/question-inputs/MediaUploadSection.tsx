import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, FileText, ScanSearch, Sparkles, Loader2 } from "lucide-react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { MediaAttachments } from "./MediaAttachments";
import { MediaAnalysisResult, Plan5W2H } from "@/hooks/useMediaAnalysis";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";

interface MediaUploadSectionProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  questionId: string;
  inspectionId?: string;
  isReadOnly?: boolean;
  questionText?: string;
  onSaveAnalysis?: (url: string, result: MediaAnalysisResult) => void;
  onApplyAISuggestion?: (plan: Plan5W2H) => void;
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
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);

  // Ajuste aqui no handleAddActionPlan para disparar onApplyAISuggestion
  const [planoAcao, setPlanoAcao] = useState<Plan5W2H[]>([]);

  const handleAddActionPlan = useCallback((plan: Plan5W2H) => {
    setPlanoAcao(prev => [...prev, plan]);
    setAnalysisDialogOpen(false);
    if (onApplyAISuggestion) {
      onApplyAISuggestion(plan);  // <-- dispara modal 5w2h no pai
    }
  }, [onApplyAISuggestion]);

  const { uploadFile, isUploading, progress, error: uploadError } = useMediaUpload();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    if (file.size > 50 * 1024 * 1024) {
      setError("Arquivo muito grande. Tamanho máximo: 50MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
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
      const result = await uploadFile(file);
      if (result && result.url) {
        const updatedMediaUrls = [...mediaUrls, result.url];
        onMediaChange(updatedMediaUrls);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError("Erro ao enviar arquivo. Tente novamente.");
    }
  }, [uploadFile, mediaUrls, onMediaChange]);

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    const updatedMediaUrls = mediaUrls.filter(url => url !== urlToDelete);
    onMediaChange(updatedMediaUrls);
  }, [mediaUrls, onMediaChange]);

  const handleOpenPreview = useCallback((url: string) => {
    setSelectedMedia(url);
    setPreviewDialogOpen(true);
  }, []);

  const handleOpenAnalysis = useCallback((url: string, questionContext?: string) => {
    setSelectedMedia(url);
    if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
      setSelectedMediaType("image/jpeg");
    } else if (url.match(/\.(mp4|webm|mov)$/i)) {
      setSelectedMediaType("video/mp4");
    } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
      setSelectedMediaType("audio/mp3");
    } else {
      setSelectedMediaType("image/jpeg");
    }
    setAnalysisDialogOpen(true);
  }, []);

  const handleAnalysisComplete = (url: string, result: MediaAnalysisResult) => {
    if (onSaveAnalysis && selectedMedia) {
      onSaveAnalysis(selectedMedia, result);
    }
  };

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
              disabled={isUploading}
            >
              {isUploading ? (
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
            disabled={isUploading}
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
        questionText={questionText}
        onAnalysisComplete={handleAnalysisComplete}
        onAdd5W2HActionPlan={onApplyAISuggestion}
      />
      {planoAcao.length > 0 && (
        <ul className="mt-2">
          {planoAcao.map((acao, idx) => (
            <li key={idx} className="text-xs text-green-800">
              {acao.what && `O quê: ${acao.what}`}
              {acao.why && ` | Por quê: ${acao.why}`}
              {acao.who && ` | Quem: ${acao.who}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
