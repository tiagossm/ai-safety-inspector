
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin, AlertCircle, ImagePlus, X, Eye, Copy, CheckCircle, Wand2 } from "lucide-react";
import { useCEP } from "@/hooks/useCEP";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { useFormSelectionData } from "@/hooks/inspection/useFormSelectionData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MediaControlsProps {
  questionId: string;
  questionText: string;
  mediaUrls: string[];
  onMediaChange: (mediaUrls: string[]) => void;
  disabled?: boolean;
  onAnalysisComplete?: (analysisResults: any) => void;
}

interface MediaPreviewProps {
  url: string;
  onPreview: () => void;
  onRemove: () => void;
  size?: "sm" | "md" | "lg";
}

interface AIAnalysisButtonProps {
  questionId: string;
  questionText: string;
  mediaUrls: string[];
  onAnalysisComplete?: (analysisResults: any) => void;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const MAX_MEDIA_COUNT = 5;

// Helper component to display a media preview
function MediaPreview({ url, onPreview, onRemove, size = "md" }: MediaPreviewProps) {
  const previewSizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className="relative">
      <img
        src={url}
        alt="Media Preview"
        className={`rounded-md object-cover ${previewSizeClasses[size]}`}
        onClick={onPreview}
        style={{ cursor: 'pointer' }}
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 h-6 w-6 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Helper component to trigger AI analysis
function AIAnalysisButton({
  questionId,
  mediaUrls,
  questionText,
  onAnalysisComplete,
  disabled = false,
  variant = "default",
  size = "default", // Using "default" instead of "md" to match Button component type
}: AIAnalysisButtonProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalysis = useCallback(async () => {
    if (disabled || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/analyze-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: questionId,
          questionText: questionText,
          mediaUrls: mediaUrls,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze media: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysis(result);

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

      toast.success("Análise concluída com sucesso!");
    } catch (error: any) {
      console.error("Error during AI analysis:", error);
      toast.error(`Erro na análise: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [questionId, questionText, mediaUrls, onAnalysisComplete, disabled, loading]);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={disabled || loading || mediaUrls.length === 0}
        onClick={handleAnalysis}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analisando...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Analisar com IA
          </>
        )}
      </Button>

      {analysis && (
        <Dialog open={!!analysis} onOpenChange={() => setAnalysis(null)}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Análise da IA</DialogTitle>
              <DialogDescription>
                Resultados da análise das mídias da questão.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Resultado
                </Label>
                <Textarea
                  id="result"
                  className="col-span-3"
                  value={analysis.result}
                  readOnly
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function MediaControls({
  questionId,
  questionText,
  mediaUrls: initialMediaUrls,
  onMediaChange,
  disabled = false,
  onAnalysisComplete,
}: MediaControlsProps) {
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialMediaUrls || []);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setMediaUrls(initialMediaUrls || []);
  }, [initialMediaUrls]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    if (mediaUrls.length + files.length > MAX_MEDIA_COUNT) {
      toast.error(`Você pode enviar no máximo ${MAX_MEDIA_COUNT} arquivos.`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${questionId}/${file.name}`;
        const { data, error } = await supabase.storage
          .from('inspection-medias')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        const publicURL = supabase.storage
          .from('inspection-medias')
          .getPublicUrl(data.path);

        return publicURL.data.publicUrl;
      });

      const newUrls = await Promise.all(uploadPromises);
      const updatedMediaUrls = [...mediaUrls, ...newUrls];
      setMediaUrls(updatedMediaUrls);
      onMediaChange(updatedMediaUrls);
      toast.success("Mídia enviada com sucesso!");
    } catch (error: any) {
      console.error("Error uploading media:", error);
      toast.error(`Erro ao enviar mídia: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    const updatedMediaUrls = mediaUrls.filter(url => url !== urlToRemove);
    setMediaUrls(updatedMediaUrls);
    onMediaChange(updatedMediaUrls);
    setPreviewUrl(null);
  };

  const handlePreviewMedia = (url: string) => {
    setPreviewUrl(url);
  };

  const handleCopyMediaLink = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Link copiado para a área de transferência!");
      })
      .catch(err => {
        console.error("Erro ao copiar link:", err);
        toast.error("Falha ao copiar link.");
      });
  };

  const handleClearAllMedia = () => {
    setMediaUrls([]);
    onMediaChange([]);
    setPreviewUrl(null);
  };

  return (
    <div>
      {/* Media Upload */}
      <div className="mb-4">
        <Label htmlFor={`media-upload-${questionId}`} className="mb-2 block text-sm font-medium">
          Enviar Mídia ({mediaUrls.length}/{MAX_MEDIA_COUNT})
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            id={`media-upload-${questionId}`}
            multiple
            accept="image/*,video/*"
            onChange={handleUpload}
            disabled={uploading || mediaUrls.length >= MAX_MEDIA_COUNT || disabled}
            className="hidden"
          />
          <Label
            htmlFor={`media-upload-${questionId}`}
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
              uploading || mediaUrls.length >= MAX_MEDIA_COUNT || disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <ImagePlus className="mr-2 h-4 w-4" />
                Enviar Mídia
              </>
            )}
          </Label>
          {mediaUrls.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAllMedia}
              disabled={uploading || disabled}
            >
              <X className="mr-2 h-4 w-4" />
              Limpar Tudo
            </Button>
          )}
        </div>
        {mediaUrls.length >= MAX_MEDIA_COUNT && (
          <p className="mt-1 text-sm text-muted-foreground">
            Máximo de {MAX_MEDIA_COUNT} arquivos atingido.
          </p>
        )}
      </div>

      {/* Media Previews */}
      {mediaUrls.length > 0 && (
        <div className="mb-4">
          <Label className="mb-2 block text-sm font-medium">
            Mídias Enviadas
          </Label>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {mediaUrls.map(url => (
              <MediaPreview 
                key={`preview-${url}`}
                url={url} 
                onPreview={() => handlePreviewMedia(url)}
                onRemove={() => handleRemoveMedia(url)}
                size="lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Button */}
      <div className="mb-4">
        <AIAnalysisButton
          questionId={questionId}
          mediaUrls={mediaUrls}
          questionText={questionText}
          onAnalysisComplete={onAnalysisComplete}
          disabled={disabled}
          size="sm"
          variant="default"
        />
      </div>

      {/* Media Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-[75%]">
          <DialogHeader>
            <DialogTitle>Visualização da Mídia</DialogTitle>
            <DialogDescription>
              Visualize a mídia em tela cheia e copie o link.
            </DialogDescription>
          </DialogHeader>
          {previewUrl && (
            <div className="flex justify-center items-center">
              <img
                src={previewUrl}
                alt="Media Preview"
                className="rounded-md object-contain max-h-[600px]"
              />
            </div>
          )}
          <DialogFooter>
            {previewUrl && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleCopyMediaLink(previewUrl)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            )}
            <DialogClose asChild>
              <Button type="button">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
