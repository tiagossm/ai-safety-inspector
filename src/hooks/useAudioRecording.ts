
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

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
            toast({
              title: "Áudio gravado com sucesso",
              variant: "default"
            });
          }
        } catch (error: any) {
          toast({
            title: `Erro ao salvar áudio: ${error.message}`,
            variant: "destructive"
          });
        } finally {
          setAudioChunks([]);
        }
      };
      
      setAudioRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      toast({
        title: "Não foi possível iniciar a gravação de áudio",
        variant: "destructive"
      });
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
