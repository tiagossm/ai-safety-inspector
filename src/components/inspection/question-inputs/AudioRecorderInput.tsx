import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause, Square, Download } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderInputProps {
  value?: string[];
  onChange: (audioUrls: string[]) => void;
  maxRecordings?: number;
  maxDurationMs?: number;
  readOnly?: boolean;
}

export function AudioRecorderInput({
  value = [],
  onChange,
  maxRecordings = 5,
  maxDurationMs = 300000, // 5 minutos por padrão
  readOnly = false
}: AudioRecorderInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementsRef = useRef<(HTMLAudioElement | null)[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Cleanup audio elements
      audioElementsRef.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const startRecording = async () => {
    if (readOnly || value.length >= maxRecordings) {
      toast.error(`Máximo de ${maxRecordings} gravações permitidas`);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newAudioUrls = [...value, audioUrl];
        onChange(newAudioUrls);
        
        // Incrementar contador de gravações
        setCurrentRecordingIndex(prev => prev + 1);
        
        // Limpar stream
        stream.getTracks().forEach(track => track.stop());
        
        toast.success(`Gravação ${currentRecordingIndex + 1} concluída`);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer para controlar duração
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1000;
          if (newTime >= maxDurationMs) {
            stopRecording();
            toast.warning('Tempo máximo de gravação atingido');
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast.error('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const playAudio = (index: number) => {
    if (playingIndex === index) {
      // Pausar se já estiver tocando
      const audio = audioElementsRef.current[index];
      if (audio) {
        audio.pause();
        setPlayingIndex(null);
      }
      return;
    }

    // Pausar outros áudios
    audioElementsRef.current.forEach(audio => {
      if (audio) audio.pause();
    });

    const audioUrl = value[index];
    const audio = new Audio(audioUrl);
    audioElementsRef.current[index] = audio;

    audio.play().then(() => {
      setPlayingIndex(index);
    }).catch(error => {
      console.error('Erro ao reproduzir áudio:', error);
      toast.error('Erro ao reproduzir áudio');
    });

    audio.onended = () => {
      setPlayingIndex(null);
    };

    audio.onerror = () => {
      setPlayingIndex(null);
      toast.error('Erro ao carregar áudio');
    };
  };

  const deleteRecording = (index: number) => {
    const newAudioUrls = value.filter((_, i) => i !== index);
    onChange(newAudioUrls);
    
    // Limpar elemento de áudio
    const audio = audioElementsRef.current[index];
    if (audio) {
      audio.pause();
      audio.src = '';
      audioElementsRef.current[index] = null;
    }
    
    if (playingIndex === index) {
      setPlayingIndex(null);
    }
    
    toast.success('Gravação removida');
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = (index: number) => {
    const audioUrl = value[index];
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `gravacao-${index + 1}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Controles de gravação */}
      {!readOnly && (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <Button
                type="button"
                size="sm"
                onClick={startRecording}
                disabled={value.length >= maxRecordings}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Mic className="h-4 w-4 mr-1" />
                Gravar {value.length > 0 ? `(${value.length + 1}/${maxRecordings})` : ''}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
              >
                <MicOff className="h-4 w-4 mr-1" />
                Parar
              </Button>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span>Gravando: {formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
      )}

      {/* Lista de gravações */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Gravações ({value.length}/{maxRecordings})
          </h4>
          
          {value.map((audioUrl, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 border rounded-lg bg-white"
            >
              <div className="flex items-center gap-2 flex-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => playAudio(index)}
                  className="h-8 w-8 p-0"
                >
                  {playingIndex === index ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
                
                <span className="text-sm text-gray-600">
                  Gravação {index + 1}
                </span>
                
                {playingIndex === index && (
                  <span className="text-xs text-blue-600 animate-pulse">
                    Reproduzindo...
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadAudio(index)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
                
                {!readOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteRecording(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informações adicionais */}
      {value.length === 0 && !isRecording && (
        <div className="text-center p-4 text-gray-500 text-sm">
          <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma gravação de áudio</p>
          {!readOnly && (
            <p>Clique em "Gravar" para adicionar uma gravação</p>
          )}
        </div>
      )}
    </div>
  );
}