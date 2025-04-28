import React, { useRef, useState } from "react";
import { MediaCaptureButtons } from "./MediaCaptureButtons";
import { MediaList } from "./MediaList";
import { MediaPreview } from "./MediaPreview";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { toast } from "sonner";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaChunks = useRef<BlobPart[]>([]);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  const { isRecording, startRecording, stopRecording } = useAudioRecording(onMediaUpload);

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
        onMediaChange([...mediaUrls, url]);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        if (onAIAnalysis && ['image', 'video'].includes(fileType)) {
          analyzeMediaWithAI(url);
        }
      }
    } catch (error: any) {
      toast.error(`Erro ao adicionar mídia: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeMediaWithAI = async (mediaUrl: string) => {
    try {
      toast.info("Analisando mídia com IA...");
      
      setTimeout(() => {
        if (onAIAnalysis) {
          const comment = `Análise automática: Esta mídia mostra evidências relacionadas à questão "${questionText.substring(0, 50)}...".`;
          const actionPlan = "Recomendamos verificar os procedimentos de segurança descritos no manual de operações.";
          onAIAnalysis(comment, actionPlan);
          toast.success("Análise de mídia concluída");
        }
      }, 2000);
    } catch (error) {
      console.error("Erro na análise de IA:", error);
    }
  };

  const handleAddMedia = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    const updatedUrls = mediaUrls.filter(url => url !== urlToRemove);
    onMediaChange(updatedUrls);
    toast.success("Mídia removida com sucesso");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Não foi possível acessar a câmera. Verifique as permissões.");
      handleAddMedia();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            try {
              setIsUploading(true);
              const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
              const url = await onMediaUpload(file);
              if (url) {
                onMediaChange([...mediaUrls, url]);
                toast.success("Foto capturada com sucesso");
                if (onAIAnalysis) {
                  analyzeMediaWithAI(url);
                }
              }
            } catch (error: any) {
              toast.error(`Erro ao salvar foto: ${error.message}`);
            } finally {
              setIsUploading(false);
              stopCamera();
            }
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setShowVideoRecorder(true);
      
      const recorder = new MediaRecorder(stream);
      mediaChunks.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          mediaChunks.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const videoBlob = new Blob(mediaChunks.current, { type: 'video/mp4' });
        const url = URL.createObjectURL(videoBlob);
        setVideoPreviewUrl(url);
        setRecordedBlob(videoBlob);
        setRecording(false);
      };
      
      setMediaRecorder(recorder);
      
      recorder.start();
      setRecording(true);
      
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 120000);
    } catch (error) {
      console.error("Error starting video recording:", error);
      toast.error("Não foi possível iniciar a gravação de vídeo. Verifique as permissões.");
      handleAddMedia();
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const discardVideoRecording = () => {
    setVideoPreviewUrl(null);
    setRecordedBlob(null);
    stopVideoStream();
  };

  const saveVideoRecording = async () => {
    if (recordedBlob) {
      try {
        setIsUploading(true);
        const file = new File([recordedBlob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
        const url = await onMediaUpload(file);
        if (url) {
          onMediaChange([...mediaUrls, url]);
          toast.success("Vídeo salvo com sucesso");
          if (onAIAnalysis) {
            analyzeMediaWithAI(url);
          }
        }
      } catch (error: any) {
        toast.error(`Erro ao salvar vídeo: ${error.message}`);
      } finally {
        setIsUploading(false);
        discardVideoRecording();
        stopVideoStream();
      }
    }
  };

  const stopVideoStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowVideoRecorder(false);
  };

  const handlePhotoCapture = () => {
    startCamera();
  };

  const handleVideoCapture = () => {
    startVideoRecording();
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

      {showCamera && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-lg w-full p-4 space-y-4">
            <h3 className="font-medium text-lg">Capturar Foto</h3>
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                onClick={stopCamera}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={capturePhoto}
              >
                Tirar Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoRecorder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-lg w-full p-4 space-y-4">
            <h3 className="font-medium text-lg">
              {videoPreviewUrl ? "Pré-visualização do Vídeo" : "Gravar Vídeo"}
            </h3>
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              {videoPreviewUrl ? (
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              {recording && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  REC
                </div>
              )}
            </div>
            <div className="flex justify-between">
              {videoPreviewUrl ? (
                <>
                  <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    onClick={discardVideoRecording}
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    onClick={saveVideoRecording}
                  >
                    Salvar Vídeo
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    onClick={stopVideoStream}
                  >
                    Cancelar
                  </button>
                  {recording ? (
                    <button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      onClick={stopVideoRecording}
                    >
                      Parar Gravação
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      onClick={() => mediaRecorder?.start()}
                    >
                      Iniciar Gravação
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <MediaCaptureButtons 
            allowsPhoto={allowsPhoto}
            allowsVideo={allowsVideo}
            allowsAudio={allowsAudio}
            allowsFiles={allowsFiles}
            disabled={disabled}
            isUploading={isUploading}
            isRecording={isRecording}
            onAddMedia={handleAddMedia}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onPhotoCapture={handlePhotoCapture}
            onVideoCapture={handleVideoCapture}
          />
        </div>

        {onAIAnalysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
            className="ml-auto"
          >
            <Brain className="h-4 w-4 mr-2" />
            {showAIAnalysis ? "Desativar IA" : "Ativar IA"}
          </Button>
        )}
      </div>

      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-md">
          {mediaUrls.map((url, index) => (
            <MediaPreview
              key={`${url}-${index}`}
              url={url}
              onPreview={() => setPreviewUrl(url)}
              onRemove={() => handleRemoveMedia(url)}
              size="lg"
            />
          ))}
        </div>
      )}

      {showAIAnalysis && onAIAnalysis && mediaUrls.length > 0 && (
        <div className="p-3 border rounded-md bg-blue-50">
          <div className="flex items-center mb-2">
            <Brain className="h-4 w-4 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-700">Análise de Inteligência Artificial</h3>
          </div>
          <AIAnalysisButton
            questionId={questionId}
            mediaUrls={mediaUrls}
            questionText={questionText}
            onAnalysisComplete={onAIAnalysis}
            disabled={mediaUrls.length === 0}
            size="sm"
            variant="default"
          />
        </div>
      )}

      <MediaPreviewDialog 
        previewUrl={previewUrl} 
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      />
    </div>
  );
}
