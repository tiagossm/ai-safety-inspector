
import { CalendarClock, Building2, User, Flag, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInspectionStatus } from "@/utils/formatInspectionStatus";
import { InspectionDetails } from "@/types/newChecklist";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionCardProps {
  inspection: InspectionDetails;
  onView?: (id: string) => void;
}

export function InspectionCard({ inspection, onView }: InspectionCardProps) {
  const statusInfo = formatInspectionStatus(inspection.status);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não agendada";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-500";
      case "medium": return "bg-amber-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };
  
  const handleOpenInspection = () => {
    if (onView) {
      onView(inspection.id);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg">{inspection.title}</h3>
          <Badge 
            variant={statusInfo.label === "Concluído" ? "default" : "outline"}
            className={`${statusInfo.label === "Concluído" ? "" : `text-${statusInfo.color}-500 border-${statusInfo.color}-200`}`}
          >
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          {inspection.company && (
            <div className="flex items-center text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 mr-2" />
              <span>{inspection.companyName || "Empresa não especificada"}</span>
            </div>
          )}
          
          {inspection.responsible && (
            <div className="flex items-center text-muted-foreground">
              <User className="h-3.5 w-3.5 mr-2" />
              <span>{inspection.responsibleName || "Responsável não especificado"}</span>
            </div>
          )}
          
          <div className="flex items-center text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 mr-2" />
            <span>{formatDate(inspection.scheduledDate)}</span>
          </div>
          
          {inspection.priority && (
            <div className="flex items-center text-muted-foreground">
              <Flag className="h-3.5 w-3.5 mr-2" />
              <div className="flex items-center gap-2">
                <span>Prioridade:</span>
                <span className={`w-2 h-2 rounded-full ${getPriorityColor(inspection.priority)}`}></span>
                <span className="capitalize">{inspection.priority}</span>
              </div>
            </div>
          )}
        </div>
        
        {typeof inspection.progress === 'number' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progresso</span>
              <span>{inspection.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${inspection.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Button 
          variant="default" 
          className="w-full"
          onClick={handleOpenInspection}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {inspection.status === "completed" ? "Ver Resultados" : "Continuar Inspeção"}
        </Button>
      </CardFooter>
    </Card>
  );
}
