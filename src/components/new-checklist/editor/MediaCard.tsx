
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Camera, Video, Mic, FileText, Upload } from "lucide-react";

interface MediaCardProps {
  question: ChecklistQuestion;
  onUpdate: (updates: Partial<ChecklistQuestion>) => void;
}

export function MediaCard({ question, onUpdate }: MediaCardProps) {
  const handleEvidenceChange = (field: keyof ChecklistQuestion, checked: boolean) => {
    onUpdate({ [field]: checked });
  };

  const handleReferenceUpload = (type: 'photo' | 'video' | 'audio' | 'file') => {
    // TODO: Implementar upload de materiais de referência
    console.log(`Upload de ${type} para referência`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Mídia
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Materiais de referência */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Materiais de referência
          </Label>
          <p className="text-xs text-gray-500 mb-2">
            Anexos visíveis durante a inspeção (manuais, fotos de exemplo, etc.)
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleReferenceUpload('photo')}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Foto de referência
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleReferenceUpload('video')}
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Vídeo explicativo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleReferenceUpload('audio')}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Áudio instrucional
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleReferenceUpload('file')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Documento
            </Button>
          </div>
        </div>

        <Separator />

        {/* Evidências permitidas */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Evidências permitidas
          </Label>
          <p className="text-xs text-gray-500 mb-3">
            Tipos de arquivo que o inspetor pode anexar como evidência
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`photo-${question.id}`}
                checked={question.allowsPhoto}
                onCheckedChange={(checked) => handleEvidenceChange('allowsPhoto', !!checked)}
              />
              <Label htmlFor={`photo-${question.id}`} className="text-sm flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fotos
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`video-${question.id}`}
                checked={question.allowsVideo}
                onCheckedChange={(checked) => handleEvidenceChange('allowsVideo', !!checked)}
              />
              <Label htmlFor={`video-${question.id}`} className="text-sm flex items-center gap-2">
                <Video className="h-4 w-4" />
                Vídeos
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`audio-${question.id}`}
                checked={question.allowsAudio}
                onCheckedChange={(checked) => handleEvidenceChange('allowsAudio', !!checked)}
              />
              <Label htmlFor={`audio-${question.id}`} className="text-sm flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Áudio
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`files-${question.id}`}
                checked={question.allowsFiles}
                onCheckedChange={(checked) => handleEvidenceChange('allowsFiles', !!checked)}
              />
              <Label htmlFor={`files-${question.id}`} className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Arquivos
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
