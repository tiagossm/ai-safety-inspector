import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, File, Mic, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { AIAnalysisButton } from "./AIAnalysisButton";

interface MediaControlsProps {
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  mediaUrls: string[];
  questionId: string;
  questionText: string;
  disabled?: boolean;
  onMediaUpload: (file: File) => Promise<string | null>;
  onMediaChange: (urls: string[]) => void;
  onAIAnalysis?: (comment: string, actionPlan?: string) => void;
}

export function MediaControls({
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  mediaUrls = [],
  questionId,
  questionText,
  disabled = false,
  onMediaUpload,
  onMediaChange,
  onAIAnalysis
}: MediaControlsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split('/')[0];
    const isValidFile = 
      (allowsPhoto && fileType === 'image') || 
      (allowsVideo && fileType === 'video') || 
      (allowsAudio && fileType === 'audio') || 
      (allowsFiles && !['image', 'video', 'audio'].includes(fileType));

    if (!isValidFile) {
      toast.error("Tipo de arquivo não permitido");
      return;
    }

    try {
      setIsUploading(true);
      const url = await onMediaUpload(file);
      if (url) {
        toast.success("Mídia adicionada com sucesso");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      toast.error(`Erro ao adicionar mídia: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    const updatedUrls = mediaUrls.filter(url => url !== urlToRemove);
    onMediaChange(updatedUrls);
    toast.success("Mídia removida com sucesso");
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recorder: MediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm' 
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
        
        try {
          setIsUploading(true);
          const url = await onMediaUpload(audioFile);
          if (url) {
            toast.success("Áudio gravado com sucesso");
          }
        } catch (error: any) {
          toast.error(`Erro ao salvar áudio: ${error.message}`);
        } finally {
          setIsUploading(false);
          setAudioChunks([]);
        }
      };
      
      setAudioRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      toast.error("Não foi possível iniciar a gravação de áudio");
    }
  };
  
  const stopAudioRecording = () => {
    if (audioRecorder && audioRecorder.state !== "inactive") {
      audioRecorder.stop();
      audioRecorder.stream?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleAddMedia = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const renderMediaPreview = (url: string) => {
    if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
      return (
        <div className="relative group hover:opacity-90 transition-opacity">
          <img src={url} alt="Media preview" className="h-16 w-16 object-cover rounded-md" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/30 hover:bg-white/50"
              onClick={() => handlePreview(url)}
            >
              <Eye className="h-4 w-4 text-white" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/30 hover:bg-red-500/50 ml-1"
              onClick={() => handleRemoveMedia(url)}
            >
              <Trash2 className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      );
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <div className="relative group hover:opacity-90 transition-opacity">
          <div className="h-16 w-16 flex items-center justify-center bg-muted rounded-md">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/30 hover:bg-white/50"
              onClick={() => handlePreview(url)}
            >
              <Eye className="h-4 w-4 text-white" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/30 hover:bg-red-500/50 ml-1"
              onClick={() => handleRemoveMedia(url)}
            >
              <Trash2 className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      );
    } else if (url.match(/\.(mp3|wav)$/i)) {
      return (
        <div className="relative group hover:opacity-90 transition-opacity">
          <div className="h-16 w-16 flex items-center justify-center bg-muted rounded-md">
            <Mic className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/30 hover:bg-white/50"
              onClick={() => handlePreview(url)}
            >
              <Eye className="h-4 w-4 text-white" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/30 hover:bg-red-500/50 ml-1"
              onClick={() => handleRemoveMedia(url)}
            >
              <Trash2 className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative group hover:opacity-90 transition-opacity">
          <div className="h-16 w-16 flex items-center justify-center bg-muted rounded-md">
            <File className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/30 hover:bg-white/50"
              onClick={() => handlePreview(url)}
            >
              <Eye className="h-4 w-4 text-white" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/30 hover:bg-red-500/50 ml-1"
              onClick={() => handleRemoveMedia(url)}
            >
              <Trash2 className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      );
    }
  };

  if (!allowsPhoto && !allowsVideo && !allowsAudio && !allowsFiles) {
    return null;
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept={[
          allowsPhoto && 'image/*',
          allowsVideo && 'video/*',
          allowsAudio && 'audio/*',
          allowsFiles && '*/*'
        ].filter(Boolean).join(',')}
      />

      <div className="flex flex-wrap gap-2">
        {allowsPhoto && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMedia}
            disabled={disabled || isUploading}
            className="flex items-center"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            <span>Foto</span>
          </Button>
        )}
        
        {allowsVideo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMedia}
            disabled={disabled || isUploading}
            className="flex items-center"
          >
            <Video className="h-4 w-4 mr-2" />
            <span>Vídeo</span>
          </Button>
        )}
        
        {allowsAudio && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={isRecording ? stopAudioRecording : startAudioRecording}
            disabled={disabled || isUploading}
            className={`flex items-center ${isRecording ? 'bg-red-100 border-red-500' : ''}`}
          >
            <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'text-red-500' : ''}`} />
            <span>{isRecording ? 'Parar Gravação' : 'Gravar Áudio'}</span>
          </Button>
        )}
        
        {allowsFiles && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMedia}
            disabled={disabled || isUploading}
            className="flex items-center"
          >
            <File className="h-4 w-4 mr-2" />
            <span>Arquivo</span>
          </Button>
        )}

        {mediaUrls.length > 0 && onAIAnalysis && (
          <AIAnalysisButton 
            questionId={questionId}
            mediaUrls={mediaUrls}
            questionText={questionText}
            onAnalysisComplete={onAIAnalysis}
            disabled={disabled || mediaUrls.length === 0}
          />
        )}
      </div>

      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {mediaUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="relative">
              {renderMediaPreview(url)}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-4">
            {previewUrl && previewUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
              <img src={previewUrl} alt="Preview" className="max-h-[70vh] max-w-full object-contain" />
            ) : previewUrl && previewUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={previewUrl} controls className="max-h-[70vh] max-w-full" />
            ) : previewUrl && previewUrl.match(/\.(mp3|wav|webm)$/i) ? (
              <audio src={previewUrl} controls className="w-full" />
            ) : (
              <div className="p-8 text-center">
                <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p>Pré-visualização não disponível para este tipo de arquivo.</p>
                <a 
                  href={previewUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Abrir em nova janela
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
