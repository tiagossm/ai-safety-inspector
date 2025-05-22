
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  CalendarIcon,
  CheckCircle2,
  Clock,
  ClipboardList,
  FileText,
  MapPin,
  User,
} from "lucide-react";

interface InspectionSummaryProps {
  inspection: any;
  responsibleName?: string;
  companyName?: string;
  checklistTitle?: string;
}

export function InspectionSummary({ 
  inspection,
  responsibleName,
  companyName,
  checklistTitle
}: InspectionSummaryProps) {
  if (!inspection) return null;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluído":
      case "Concluido":
      case "Completed":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "Em Andamento":
      case "In Progress":
        return <Badge className="bg-blue-500">Em Andamento</Badge>;
      case "Pendente":
      case "Pending":
      default:
        return <Badge className="bg-yellow-500">Pendente</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-500">Alta</Badge>;
      case "medium":
        return <Badge className="bg-orange-500">Média</Badge>;
      case "low":
        return <Badge className="bg-green-500">Baixa</Badge>;
      default:
        return <Badge className="bg-slate-500">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ClipboardList className="h-5 w-5 mr-2" />
            Resumo da Inspeção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div>
              <h3 className="font-medium text-sm flex items-center">
                <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                Checklist
              </h3>
              <p className="text-sm mt-1">{checklistTitle || inspection.checklist_title || "N/A"}</p>
            </div>
            
            <div className="flex gap-2 items-start">
              {getStatusBadge(inspection.status)}
              {inspection.priority && getPriorityBadge(inspection.priority)}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm flex items-center">
                <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                Empresa
              </h3>
              <p className="text-sm mt-1">{companyName || inspection.companyName || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm flex items-center">
                <User className="h-4 w-4 mr-1 text-muted-foreground" />
                Responsável
              </h3>
              <p className="text-sm mt-1">{responsibleName || inspection.responsibleName || "N/A"}</p>
            </div>
            
            {inspection.scheduled_date && (
              <div>
                <h3 className="font-medium text-sm flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  Data Agendada
                </h3>
                <p className="text-sm mt-1">{format(new Date(inspection.scheduled_date), 'PPP')}</p>
              </div>
            )}
            
            {inspection.location && (
              <div>
                <h3 className="font-medium text-sm flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  Localização
                </h3>
                <p className="text-sm mt-1">{inspection.location}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium text-sm flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                Criado em
              </h3>
              <p className="text-sm mt-1">
                {inspection.created_at ? format(new Date(inspection.created_at), 'PPP') : "N/A"}
              </p>
            </div>
            
            {inspection.status === "Concluído" && inspection.updated_at && (
              <div>
                <h3 className="font-medium text-sm flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-muted-foreground" />
                  Concluído em
                </h3>
                <p className="text-sm mt-1">{format(new Date(inspection.updated_at), 'PPP')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
