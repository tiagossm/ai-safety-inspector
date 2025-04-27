
import { useState } from 'react';
import { toast } from "sonner";

export const useAudioRecording = (onMediaUpload: (file: File) => Promise<string | null>) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
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
          const url = await onMediaUpload(audioFile);
          if (url) {
            toast.success("Áudio gravado com sucesso");
          }
        } catch (error: any) {
          toast.error(`Erro ao salvar áudio: ${error.message}`);
        } finally {
          setAudioChunks([]);
        }
      };
      
      setAudioRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);

      // Auto-stop after 3 minutes (180000ms)
      setTimeout(() => {
        if (recorder && recorder.state !== "inactive") {
          stopRecording();
        }
      }, 180000);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      toast.error("Não foi possível iniciar a gravação de áudio");
    }
  };

  const stopRecording = () => {
    if (audioRecorder && audioRecorder.state !== "inactive") {
      audioRecorder.stop();
      audioRecorder.stream?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};
