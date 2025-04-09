
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { InspectionDetails } from "@/types/newChecklist";
import { Building2, Calendar, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

interface InspectionCardProps {
  inspection: InspectionDetails;
  onViewClick: (id: string) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-green-500";
    case "medium":
      return "bg-yellow-500";
    case "high":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "outline";
    case "in_progress":
      return "secondary";
    case "completed":
      return "default";
    default:
      return "outline";
  }
};

const getStatusDisplayText = (status: string) => {
  switch (status) {
    case "pending":
      return "Pendente";
    case "in_progress":
      return "Em progresso";
    case "completed":
      return "Concluído";
    default:
      return status;
  }
};

export const InspectionCard = ({ inspection, onViewClick }: InspectionCardProps) => {
  const formattedDate = inspection.scheduledDate 
    ? format(new Date(inspection.scheduledDate), 'dd/MM/yyyy')
    : "Não agendada";

  const companyName = inspection.company?.name || "Empresa não atribuída";
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{inspection.title}</h3>
            <div className="flex items-center text-muted-foreground text-sm gap-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>{inspection.company && companyName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`${getPriorityColor(inspection.priority)} h-2 w-2 rounded-full`} />
            <Badge variant={getStatusBadgeVariant(inspection.status)}>
              {getStatusDisplayText(inspection.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow pt-0">
        <div className="py-2 flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-sm">{formattedDate}</span>
        </div>

        <div className="space-y-2 mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-sm">{inspection.progress}% completo</span>
            {inspection.status === "completed" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : inspection.status === "in_progress" ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : null}
          </div>
          <Progress value={inspection.progress} className="h-2" />
          <Button 
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => onViewClick(inspection.id)}
          >
            Ver detalhes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
