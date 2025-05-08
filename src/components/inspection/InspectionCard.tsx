
import React from "react";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { BadgePriority } from "@/components/ui/badge-priority";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, ClipboardList, MapPin, Eye } from "lucide-react";
import { InspectionDetails } from "@/types/newChecklist";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionCardProps {
  inspection: InspectionDetails;
  onView: () => void;
}

export function InspectionCard({ inspection, onView }: InspectionCardProps) {
  const formattedDate = inspection.scheduledDate 
    ? formatDistance(new Date(inspection.scheduledDate), new Date(), { 
        addSuffix: true,
        locale: ptBR
      })
    : "Sem data";
    
  // Determine card variant based on priority
  const getCardVariant = () => {
    switch (inspection.priority) {
      case "high": return "highlight";
      default: return "default";
    }
  };
  
  // Map status to badge variant
  const getStatusVariant = () => {
    switch (inspection.status) {
      case "completed": return "completed";
      case "in_progress": return "inProgress";
      default: return "pending";
    }
  };
  
  // Map status to readable text
  const getStatusText = () => {
    switch (inspection.status) {
      case "completed": return "Concluído";
      case "in_progress": return "Em progresso";
      default: return "Pendente";
    }
  };
  
  // Map priority to badge variant
  const getPriorityVariant = () => {
    switch (inspection.priority) {
      case "high": return "high";
      case "medium": return "medium";
      case "low": return "low";
      default: return "default";
    }
  };
  
  // Map priority to readable text
  const getPriorityText = () => {
    switch (inspection.priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return "Normal";
    }
  };
  
  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <DataCard variant={getCardVariant()}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-base line-clamp-1">{inspection.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {inspection.company?.fantasy_name || "Empresa não especificada"}
            </p>
          </div>
          <BadgeStatus variant={getStatusVariant()}>{getStatusText()}</BadgeStatus>
        </div>
        
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            <span>{typeof inspection.progress === 'number' ? `${inspection.progress}% completo` : "Progresso não disponível"}</span>
          </div>
          
          {inspection.locationName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{inspection.locationName}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getInitials(inspection.responsible?.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs truncate max-w-[100px]">
              {inspection.responsible?.name || "Não atribuído"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <BadgePriority variant={getPriorityVariant()}>{getPriorityText()}</BadgePriority>
            <Button variant="ghost" size="sm" onClick={onView} className="p-1 h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DataCard>
  );
}
