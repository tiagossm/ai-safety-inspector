
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Video, Mic, FileText } from "lucide-react";

interface MediaToggleProps {
  enableAllMedia: boolean;
  onToggle: (enabled: boolean) => void;
}

export function MediaToggle({ enableAllMedia, onToggle }: MediaToggleProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Recursos de Mídia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="enable-all-media" className="text-sm font-medium">
              Habilitar recursos de mídia para todas as perguntas
            </Label>
          </div>
          <Switch
            id="enable-all-media"
            checked={enableAllMedia}
            onCheckedChange={onToggle}
          />
        </div>
        
        {enableAllMedia && (
          <div className="flex items-center gap-4 text-xs text-green-600 bg-green-50 p-3 rounded-md">
            <div className="flex items-center gap-1">
              <Image className="h-3 w-3" />
              <span>Fotos</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              <span>Vídeos</span>
            </div>
            <div className="flex items-center gap-1">
              <Mic className="h-3 w-3" />
              <span>Áudio</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Arquivos</span>
            </div>
          </div>
        )}
        
        {!enableAllMedia && (
          <p className="text-xs text-gray-500">
            Os recursos de mídia podem ser habilitados individualmente para cada pergunta
          </p>
        )}
      </CardContent>
    </Card>
  );
}
