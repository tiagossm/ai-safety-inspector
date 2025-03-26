
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Calendar, 
  User2, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  FileText,
  Share2 
} from "lucide-react";
import { InspectionDetails } from "@/types/newChecklist";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionCardProps {
  inspection: InspectionDetails & {
    company?: {
      name?: string;
      fantasy_name?: string;
    };
    responsible?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    progress?: number;
  };
  onView: () => void;
}

export function InspectionCard({ inspection, onView }: InspectionCardProps) {
  const formatDate = (date: string | undefined) => {
    if (!date) return "Não agendada";
    try {
      return format(new Date(date), "PPP", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Concluída</Badge>;
      case "in_progress":
        return <Badge variant="default">Em progresso</Badge>;
      case "pending":
      default:
        return <Badge variant="warning">Pendente</Badge>;
    }
  };

  const getPriorityBadge = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs text-red-500 font-medium">Alta</span>
          </div>
        );
      case "medium":
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-amber-500 font-medium">Média</span>
          </div>
        );
      case "low":
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-green-500 font-medium">Baixa</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getCompanyName = () => {
    if (!inspection.company) return "Empresa não informada";
    return inspection.company.fantasy_name || inspection.company.name || "Empresa sem nome";
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!inspection.responsible?.phone) {
      toast.error("Não há telefone cadastrado para o responsável");
      return;
    }

    const phoneNumber = inspection.responsible.phone.replace(/\D/g, "");
    const message = `Inspeção: ${inspection.title || "Sem título"}
Status: ${inspection.status === "completed" ? "Concluída" : inspection.status === "in_progress" ? "Em progresso" : "Pendente"}
Data: ${formatDate(inspection.scheduledDate)}
Empresa: ${getCompanyName()}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleExportPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Funcionalidade de exportação para PDF em desenvolvimento");
  };

  const handleActionPlan = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Funcionalidade de plano de ação em desenvolvimento");
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={onView}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {getStatusBadge(inspection.status)}
          {getPriorityBadge(inspection.priority)}
        </div>
        <CardTitle className="text-base line-clamp-1">{inspection.title || "Inspeção sem título"}</CardTitle>
        <CardDescription className="line-clamp-1">{inspection.description || "Sem descrição"}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">{getCompanyName()}</span>
          </div>
          
          {inspection.responsible && (
            <div className="flex items-center gap-2 text-sm">
              <User2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{inspection.responsible.name || "Responsável não informado"}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatDate(inspection.scheduledDate)}</span>
          </div>
        </div>
        
        {typeof inspection.progress === 'number' && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Progresso</span>
              <span className="text-xs font-medium">{inspection.progress}%</span>
            </div>
            <Progress 
              value={inspection.progress} 
              className="h-1.5"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-1.5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleShareWhatsApp}
            title="Compartilhar via WhatsApp"
            disabled={!inspection.responsible?.phone}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleExportPDF}
            title="Exportar para PDF"
          >
            <FileText className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleActionPlan}
            title="Plano de ação"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="gap-1.5"
          onClick={onView}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Ver</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
