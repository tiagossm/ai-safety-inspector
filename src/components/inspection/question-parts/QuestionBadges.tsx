
import React from "react";
import { Badge } from "@/components/ui/badge";

interface QuestionBadgesProps {
  isRequired: boolean;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsFiles: boolean;
}

export function QuestionBadges({
  isRequired,
  allowsPhoto,
  allowsVideo,
  allowsAudio,
  allowsFiles
}: QuestionBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {isRequired && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
      {allowsPhoto && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">Foto</Badge>}
      {allowsVideo && <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">Vídeo</Badge>}
      {allowsAudio && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">Áudio</Badge>}
      {allowsFiles && <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">Arquivo</Badge>}
    </div>
  );
}
