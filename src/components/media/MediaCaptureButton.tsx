
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { Mic, Video, StopCircle, Upload, Camera } from 'lucide-react';
import { toast } from "sonner";

// Add type declaration for ImageCapture API
declare global {
  interface Window {
    ImageCapture: typeof ImageCapture;
  }
}

interface MediaCaptureButtonProps {
  type: 'audio' | 'video' | 'photo';
  onMediaCaptured: (mediaData: any) => void;
  className?: string;
}

export function MediaCaptureButton({ 
  type, 
  onMediaCaptured,
  className = '' 
}: MediaCaptureButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { uploadMedia, isUploading } = useMediaUpload();
  
  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: type === 'audio' || type === 'video',
        video: type === 'video' || type === 'photo' ? { facingMode: 'environment' } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      
      if (type === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      if (type === 'photo') {
        takePhoto(stream);
        return;
      }
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
        const blob = new Blob(chunks, { type: mimeType });
        
        try {
          const result = await uploadMedia(blob, mimeType);
          onMediaCaptured(result);
          toast.success(`${type === 'audio' ? 'Áudio' : 'Vídeo'} gravado com sucesso!`);
        } catch (error) {
          toast.error(`Erro ao processar ${type === 'audio' ? 'áudio' : 'vídeo'}`);
        }
        
        setIsRecording(false);
        stopMediaStream();
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error(`Não foi possível acessar ${type === 'audio' ? 'microfone' : (type === 'video' ? 'câmera' : 'dispositivos de mídia')}`);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };
  
  const takePhoto = async (stream: MediaStream) => {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      
      // Use the ImageCapture API if available
      if (typeof ImageCapture !== 'undefined') {
        const imageCapture = new ImageCapture(videoTrack);
        const bitmap = await imageCapture.grabFrame();
        
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(bitmap, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const result = await uploadMedia(blob, 'image/jpeg', 'photo.jpg');
              onMediaCaptured(result);
              toast.success('Foto capturada com sucesso!');
            } catch (error) {
              toast.error('Erro ao processar foto');
            }
          }
          stopMediaStream();
        }, 'image/jpeg');
      } else {
        // Fallback method using video element and canvas when ImageCapture is not supported
        const video = document.createElement('video');
        video.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            video.play();
            resolve();
          };
        });
        
        // Capture frame from video
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const result = await uploadMedia(blob, 'image/jpeg', 'photo.jpg');
              onMediaCaptured(result);
              toast.success('Foto capturada com sucesso!');
            } catch (error) {
              toast.error('Erro ao processar foto');
            }
          }
          stopMediaStream();
          video.srcObject = null;
        }, 'image/jpeg');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.error('Não foi possível capturar a foto');
      stopMediaStream();
    }
  };
  
  const stopMediaStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };
  
  const getButtonIcon = () => {
    if (isRecording) return <StopCircle className="h-5 w-5 mr-2" />;
    
    if (type === 'audio') return <Mic className="h-5 w-5 mr-2" />;
    if (type === 'video') return <Video className="h-5 w-5 mr-2" />;
    return <Camera className="h-5 w-5 mr-2" />;
  };
  
  const getButtonText = () => {
    if (isUploading) return "Enviando...";
    if (isRecording) return `Parar ${type === 'audio' ? 'gravação' : 'vídeo'}`;
    
    if (type === 'audio') return "Gravar áudio";
    if (type === 'video') return "Gravar vídeo";
    return "Tirar foto";
  };
  
  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      {type === 'video' && (
        <video 
          ref={videoRef} 
          className={`w-full h-48 bg-gray-100 rounded-md mb-2 ${isRecording ? 'block' : 'hidden'}`}
          muted
        />
      )}
      
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        onClick={handleClick}
        disabled={isUploading}
        className="w-full"
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>
    </div>
  );
}
