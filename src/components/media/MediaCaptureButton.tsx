import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, Mic, X, Loader2, Upload } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { toast } from 'sonner';

interface MediaCaptureButtonProps {
  type: 'photo' | 'video' | 'audio';
  onMediaCaptured: (mediaData: any) => void;
  onCaptureStart?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function MediaCaptureButton({
  type,
  onMediaCaptured,
  onCaptureStart,
  disabled = false,
  className = '',
  variant = 'outline'
}: MediaCaptureButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { uploadMedia, isUploading } = useMediaUpload();
  
  const getMediaTypeLabel = () => {
    switch(type) {
      case 'photo': return 'Tirar Foto';
      case 'video': return 'Gravar Vídeo';
      case 'audio': return 'Gravar Áudio';
    }
  };
  
  const getMediaTypeIcon = () => {
    switch(type) {
      case 'photo': return <Camera className="mr-2 h-4 w-4" />;
      case 'video': return <Video className="mr-2 h-4 w-4" />;
      case 'audio': return <Mic className="mr-2 h-4 w-4" />;
    }
  };
  
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
      
      // Auto-stop long recordings
      if (type === 'video' && recordingTime >= 30) { // 30 seconds max for video
        stopRecording();
      } else if (type === 'audio' && recordingTime >= 90) { // 90 seconds max for audio
        stopRecording();
      }
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const startCapture = async () => {
    if (disabled) return;
    
    try {
      if (onCaptureStart) {
        onCaptureStart();
      }
      
      setIsCapturing(true);
      let mediaStream: MediaStream | null = null;
      
      if (type === 'photo') {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } else if (type === 'video') {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        
        const recorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = recorder;
        
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        recorder.onstop = () => {
          setRecordedChunks(chunks);
        };
        
        recorder.start();
        setIsRecording(true);
        startTimer();
      } else if (type === 'audio') {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const recorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = recorder;
        
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        recorder.onstop = () => {
          setRecordedChunks(chunks);
        };
        
        recorder.start();
        setIsRecording(true);
        startTimer();
      }
      
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Não foi possível acessar a câmera ou microfone');
      setIsCapturing(false);
    }
  };
  
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Erro ao capturar imagem');
        return;
      }
      
      try {
        const result = await uploadMedia(blob, 'image/jpeg');
        
        if (result) {
          onMediaCaptured(result);
          toast.success('Foto capturada com sucesso!');
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast.error('Erro ao enviar foto');
      } finally {
        stopCapture();
      }
    }, 'image/jpeg');
  };
  
  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    stopTimer();
  };
  
  const uploadRecording = async () => {
    if (recordedChunks.length === 0) return;
    
    try {
      const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
      const blob = new Blob(recordedChunks, { type: mimeType });
      
      const result = await uploadMedia(blob, mimeType);
      
      if (result) {
        onMediaCaptured(result);
        toast.success(`${type === 'audio' ? 'Áudio' : 'Vídeo'} gravado com sucesso!`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Erro ao enviar ${type === 'audio' ? 'áudio' : 'vídeo'}`);
    } finally {
      setRecordedChunks([]);
      stopCapture();
    }
  };
  
  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setStream(null);
    setIsCapturing(false);
    stopTimer();
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopTimer();
    };
  }, [stream]);
  
  if (isCapturing) {
    return (
      <div className="space-y-4">
        {(type === 'photo' || type === 'video') && (
          <div className="relative overflow-hidden rounded-lg bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-auto"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={stopCapture}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {type === 'audio' && (
          <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <Mic className={`h-8 w-8 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
              <p className="mt-1 text-sm font-medium">
                {isRecording ? 'Gravando áudio...' : 'Pronto para gravar'}
              </p>
              {isRecording && <p className="text-xs">{recordingTime}s</p>}
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={stopCapture}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="flex space-x-2">
          {type === 'photo' ? (
            <Button 
              onClick={capturePhoto} 
              disabled={!stream || isUploading}
              className="flex-1"
            >
              {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
              Tirar Foto
            </Button>
          ) : isRecording ? (
            <Button 
              onClick={stopRecording} 
              variant="destructive"
              className="flex-1"
            >
              <span className="h-2 w-2 bg-current rounded-sm mr-2" /> 
              Parar {recordingTime}s
            </Button>
          ) : recordedChunks.length > 0 ? (
            <Button 
              onClick={uploadRecording} 
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? 
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                <Upload className="h-4 w-4 mr-2" />
              }
              Salvar {type === 'audio' ? 'Áudio' : 'Vídeo'}
            </Button>
          ) : (
            <Button 
              onClick={() => {
                if (mediaRecorderRef.current) {
                  mediaRecorderRef.current.start();
                  setIsRecording(true);
                  startTimer();
                }
              }} 
              variant="default"
              className="flex-1"
              disabled={!stream}
            >
              <div className="h-2 w-2 bg-red-500 rounded-full mr-2" />
              Iniciar Gravação
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={stopCapture}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Button
      variant={variant}
      onClick={startCapture}
      disabled={disabled}
      className={className}
    >
      {isUploading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        getMediaTypeIcon()
      )}
      {getMediaTypeLabel()}
    </Button>
  );
}
