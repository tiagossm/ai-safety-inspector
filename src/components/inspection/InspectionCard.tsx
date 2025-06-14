
import React from "react";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { BadgePriority } from "@/components/ui/badge-priority";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, ClipboardList, MapPin, Eye, MoreHorizontal, Trash, FileText, Calendar } from "lucide-react";
import { InspectionDetails } from "@/types/newChecklist";
import { formatDistance, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { PDFReportButton } from './PDFReportButton';

interface InspectionCardProps {
  inspection: InspectionDetails;
  onView: () => void;
  onDelete?: () => void;
  onGenerateReport?: () => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export function InspectionCard({ 
  inspection, 
  onView, 
  onDelete, 
  onGenerateReport,
  isSelected = false,
  onSelect
}: InspectionCardProps) {
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

  // Verificar se a inspeção está concluída
  const isCompleted = inspection.status === "completed";

  return (
    <DataCard 
      variant={getCardVariant()} 
      className={`group relative transition-all ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}
    >
      <div className="absolute top-3 left-3 z-10">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelect?.(!!checked)}
          className={`transition-opacity ${onSelect ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="ml-6">
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
          
          {inspection.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{inspection.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(inspection.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
            {inspection.location && (
              <>
                <MapPin className="w-3 h-3 ml-2" />
                <span>{inspection.location}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <PDFReportButton 
              inspectionId={inspection.id}
              size="sm"
              variant="outline"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                </DropdownMenuItem>
                
                {isCompleted && onGenerateReport && (
                  <DropdownMenuItem onClick={onGenerateReport}>
                    <FileText className="mr-2 h-4 w-4" /> Gerar relatório
                  </DropdownMenuItem>
                )}
                
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" onClick={onView} className="p-1 h-7 w-7">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DataCard>
  );
}
