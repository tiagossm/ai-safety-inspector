
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Video, Mic, FileText, Check } from "lucide-react";

interface ImprovedMediaToggleProps {
  enableAllMedia: boolean;
  onToggle: (enabled: boolean) => void;
}

export function ImprovedMediaToggle({ enableAllMedia, onToggle }: ImprovedMediaToggleProps) {
  return (
    <Card className={`transition-colors ${enableAllMedia ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {enableAllMedia && <Check className="h-4 w-4 text-green-600" />}
            Recursos de Mídia Globais
          </CardTitle>
          <Switch
            id="enable-all-media"
            checked={enableAllMedia}
            onCheckedChange={onToggle}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-all-media" className="text-sm text-gray-700">
            Habilitar recursos de mídia para todas as perguntas
          </Label>
        </div>
        
        {enableAllMedia ? (
          <div className="flex items-center gap-4 text-xs text-green-700 bg-green-100 p-3 rounded-md">
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
        ) : (
          <p className="text-xs text-gray-500">
            Os recursos de mídia podem ser habilitados individualmente para cada pergunta nas configurações avançadas
          </p>
        )}
      </CardContent>
    </Card>
  );
}
