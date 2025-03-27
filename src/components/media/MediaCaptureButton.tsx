
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video as VideoIcon, Mic } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { toast } from 'sonner';

interface MediaCaptureButtonProps {
  type: 'photo' | 'video' | 'audio';
  onMediaCaptured: (mediaData: any) => void;
  disabled?: boolean;
  className?: string;
  onCaptureStart?: () => void;
}

export function MediaCaptureButton({
  type,
  onMediaCaptured,
  disabled = false,
  className = '',
  onCaptureStart
}: MediaCaptureButtonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { uploadMedia, isUploading, progress } = useMediaUpload();
  
  const stopMediaStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowPreview(false);
  };
  
  const capturePhoto = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      if (onCaptureStart) onCaptureStart();
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else throw new Error('Failed to create image blob');
        }, 'image/jpeg', 0.9);
      });
      
      const uploadedMedia = await uploadMedia(blob, 'image/jpeg');
      if (uploadedMedia) {
        onMediaCaptured(uploadedMedia);
        toast.success('Foto capturada com sucesso!');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Erro ao capturar foto');
    } finally {
      stopMediaStream();
    }
  };
  
  const startMediaCapture = async () => {
    try {
      if (onCaptureStart) onCaptureStart();
      
      let constraints: MediaStreamConstraints = {};
      
      if (type === 'photo' || type === 'video') {
        constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: type === 'video'
        };
      } else if (type === 'audio') {
        constraints = { audio: true };
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (type === 'photo' || type === 'video') {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setShowPreview(true);
          
          if (type === 'photo') {
            // Play video for photos to show preview
            videoRef.current.play();
          }
        }
      }
      
      if (type === 'video' || type === 'audio') {
        const mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = mediaRecorder;
        
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          try {
            const mimeType = type === 'video' ? 'video/webm' : 'audio/webm';
            const blob = new Blob(chunks, { type: mimeType });
            
            const uploadedMedia = await uploadMedia(blob, mimeType);
            if (uploadedMedia) {
              onMediaCaptured(uploadedMedia);
              toast.success(`${type === 'video' ? 'Vídeo' : 'Áudio'} capturado com sucesso!`);
            }
          } catch (error) {
            console.error(`Error capturing ${type}:`, error);
            toast.error(`Erro ao capturar ${type === 'video' ? 'vídeo' : 'áudio'}`);
          } finally {
            stopMediaStream();
            setRecording(false);
          }
        };
        
        mediaRecorder.start();
        setRecording(true);
      }
    } catch (error) {
      console.error(`Error accessing ${type} stream:`, error);
      toast.error(`Erro ao acessar ${type === 'photo' ? 'câmera' : type === 'video' ? 'câmera e microfone' : 'microfone'}`);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  };
  
  const handleClick = () => {
    if (type === 'photo') {
      if (showPreview) {
        capturePhoto();
      } else {
        startMediaCapture();
      }
    } else if ((type === 'video' || type === 'audio') && !recording) {
      startMediaCapture();
    } else if (recording) {
      stopRecording();
    }
  };
  
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      if (onCaptureStart) onCaptureStart();
      
      const mediaType = type === 'photo' ? 'image' : type;
      if (!file.type.startsWith(`${mediaType}/`)) {
        toast.error(`Arquivo não é um ${type === 'photo' ? 'imagem' : type} válido`);
        return;
      }
      
      const uploadedMedia = await uploadMedia(file, file.type, file.name);
      if (uploadedMedia) {
        onMediaCaptured(uploadedMedia);
        toast.success(`${type === 'photo' ? 'Imagem' : type === 'video' ? 'Vídeo' : 'Áudio'} enviado com sucesso!`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Erro ao enviar ${type === 'photo' ? 'imagem' : type === 'video' ? 'vídeo' : 'áudio'}`);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };
  
  const getAcceptTypes = () => {
    switch (type) {
      case 'photo': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      default: return '';
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'photo': return <Camera className="mr-2 h-4 w-4" />;
      case 'video': return <VideoIcon className="mr-2 h-4 w-4" />;
      case 'audio': return <Mic className="mr-2 h-4 w-4" />;
      default: return null;
    }
  };
  
  const getButtonText = () => {
    if (isUploading) return `Enviando...`;
    
    if (recording) {
      return `Parar${type === 'video' ? ' Gravação' : ''}`;
    }
    
    switch (type) {
      case 'photo':
        return showPreview ? 'Tirar Foto' : 'Ativar Câmera';
      case 'video':
        return 'Gravar Vídeo';
      case 'audio':
        return 'Gravar Áudio';
      default:
        return '';
    }
  };
  
  const getButtonClass = () => {
    if (recording) {
      return 'bg-red-500 hover:bg-red-600 text-white';
    }
    return '';
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col space-y-2">
        <Button
          variant={recording ? "destructive" : "outline"}
          className={`w-full ${getButtonClass()}`}
          onClick={handleClick}
          disabled={disabled || isUploading}
        >
          {getIcon()}
          {getButtonText()}
        </Button>
        
        {!showPreview && !recording && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            {getIcon()}
            {type === 'photo' ? 'Escolher Imagem' : type === 'video' ? 'Escolher Vídeo' : 'Escolher Áudio'}
          </Button>
        )}
        
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={getAcceptTypes()}
          onChange={handleFileSelection}
          disabled={disabled || isUploading}
        />
        
        {showPreview && (type === 'photo' || type === 'video') && (
          <div className="relative w-full aspect-video rounded overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay={type === 'video'}
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {isUploading && (
          <div className="w-full">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-1">
              {progress < 100 ? `Enviando ${progress}%` : 'Processando...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
