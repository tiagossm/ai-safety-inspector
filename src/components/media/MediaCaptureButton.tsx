
import React, { useState, useRef } from 'react';
import { Camera, Video, Mic, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface MediaCaptureButtonProps {
  type: 'photo' | 'video' | 'audio';
  onMediaCaptured: (mediaData: any) => void;
  maxRecordingTime?: number; // in seconds
  className?: string; // Added className prop
}

export function MediaCaptureButton({ 
  type, 
  onMediaCaptured,
  maxRecordingTime = 15, // Default to 15 seconds for video/audio
  className = '' // Default to empty string
}: MediaCaptureButtonProps) {
  const [capturing, setCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  
  const startCamera = async () => {
    try {
      const constraints = {
        video: type === 'photo' || type === 'video' 
          ? { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
          : false,
        audio: type === 'video' || type === 'audio'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current && (type === 'photo' || type === 'video')) {
        videoRef.current.srcObject = stream;
      }
      
      setCapturing(true);
      
      if (type === 'video' || type === 'audio') {
        // Prepare for recording but don't start yet
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const mimeType = type === 'video' ? 'video/webm' : 'audio/webm';
          const blob = new Blob(chunks, { type: mimeType });
          
          if (type === 'video') {
            const videoUrl = URL.createObjectURL(blob);
            setPreview(videoUrl);
          }
          
          setMediaBlob(blob);
          stopStream();
        };
        
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      toast.error('Não foi possível acessar a câmera ou microfone');
    }
  };
  
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setRecording(false);
  };
  
  const startRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.start();
    setRecording(true);
    setRecordingTime(0);
    
    // Start timer
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        
        // Auto-stop at max recording time
        if (newTime >= maxRecordingTime) {
          stopRecording();
        }
        
        return newTime;
      });
    }, 1000);
  };
  
  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    
    mediaRecorderRef.current.stop();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const takePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
      if (!blob) return;
      
      const photoUrl = URL.createObjectURL(blob);
      setPreview(photoUrl);
      setMediaBlob(blob);
      stopStream();
    }, 'image/jpeg', 0.9);
  };
  
  const cancelCapture = () => {
    if (recording) {
      stopRecording();
    }
    
    stopStream();
    setCapturing(false);
    setPreview(null);
    setMediaBlob(null);
  };
  
  const uploadMedia = async () => {
    if (!mediaBlob) return;
    
    try {
      const fileId = uuidv4();
      const fileExt = type === 'photo' ? '.jpg' : type === 'video' ? '.webm' : '.webm';
      const fileName = `${fileId}${fileExt}`;
      const filePath = `media/${fileName}`;
      
      // Create storage bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === 'media')) {
        await supabase.storage.createBucket('media', {
          public: true
        });
      }
      
      // Upload file
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, mediaBlob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      const mediaData = {
        id: fileId,
        url: urlData.publicUrl,
        type,
        name: fileName,
        size: mediaBlob.size,
        createdAt: new Date().toISOString()
      };
      
      onMediaCaptured(mediaData);
      setCapturing(false);
      setPreview(null);
      setMediaBlob(null);
    } catch (err) {
      console.error('Error uploading media:', err);
      toast.error('Erro ao fazer upload da mídia');
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Render appropriate media icon
  const renderIcon = () => {
    switch (type) {
      case 'photo':
        return <Camera className="h-5 w-5 mr-2" />;
      case 'video':
        return <Video className="h-5 w-5 mr-2" />;
      case 'audio':
        return <Mic className="h-5 w-5 mr-2" />;
    }
  };
  
  return (
    <div>
      {!capturing ? (
        <Button
          variant="outline"
          type="button"
          className="w-full flex items-center justify-center"
          onClick={startCamera}
        >
          {renderIcon()}
          <span>
            {type === 'photo' ? 'Tirar Foto' : type === 'video' ? 'Gravar Vídeo' : 'Gravar Áudio'}
          </span>
        </Button>
      ) : (
        <Card className="relative overflow-hidden">
          {(type === 'photo' || type === 'video') && !preview && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[200px] object-cover bg-black"
            />
          )}
          
          {type === 'audio' && !preview && (
            <div className="w-full h-[100px] bg-black flex items-center justify-center text-white">
              <Mic className="h-8 w-8 mb-2" />
              {recording && <div className="animate-pulse text-red-500 ml-2">● {formatTime(recordingTime)}</div>}
            </div>
          )}
          
          {preview && type === 'video' && (
            <video 
              src={preview} 
              controls 
              className="w-full max-h-[200px]"
            />
          )}
          
          {preview && type === 'photo' && (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full object-contain max-h-[200px]"
            />
          )}
          
          {preview && type === 'audio' && (
            <div className="w-full p-4 bg-gray-100 text-center">
              <p>Áudio gravado ({formatTime(recordingTime)})</p>
              <audio src={URL.createObjectURL(mediaBlob!)} controls className="mt-2 w-full" />
            </div>
          )}
          
          <div className="p-2 flex justify-between items-center bg-gray-50">
            {preview ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelCapture}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
                
                <Button
                  size="sm"
                  onClick={uploadMedia}
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Usar</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelCapture}
                >
                  <X className="h-4 w-4 mr-1" />
                  <span>Cancelar</span>
                </Button>
                
                {type === 'photo' ? (
                  <Button 
                    size="sm"
                    onClick={takePhoto}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    <span>Capturar</span>
                  </Button>
                ) : (
                  recording ? (
                    <Button 
                      size="sm"
                      variant="destructive" 
                      onClick={stopRecording}
                      className="flex items-center gap-1"
                    >
                      <span className="animate-pulse text-white mr-1">●</span>
                      <span>Parar ({formatTime(recordingTime)}/{formatTime(maxRecordingTime)})</span>
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={startRecording}
                    >
                      {type === 'video' ? <Video className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                      <span>Iniciar Gravação</span>
                    </Button>
                  )
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
