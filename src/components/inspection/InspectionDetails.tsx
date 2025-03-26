
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, User2, MapPin, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionDetailsCardProps {
  loading: boolean;
  inspection: any;
  company: any;
  responsible: any;
}

export function InspectionDetailsCard({ 
  loading, 
  inspection, 
  company, 
  responsible 
}: InspectionDetailsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Não agendada";
    try {
      return format(new Date(date), "PPP", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  const getPriorityClass = (priority: string | undefined) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-amber-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };
  
  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in_progress": return "text-blue-600";
      case "pending": return "text-amber-600";
      default: return "text-gray-600";
    }
  };
  
  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "completed": return "Concluída";
      case "in_progress": return "Em Progresso";
      case "pending": return "Pendente";
      default: return "Desconhecido";
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{inspection?.title || "Detalhes da Inspeção"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {company && (
            <div className="flex items-start gap-2">
              <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Empresa</p>
                <p className="text-sm">{company?.name || company?.fantasy_name || "Não informada"}</p>
              </div>
            </div>
          )}
          
          {responsible && (
            <div className="flex items-start gap-2">
              <User2 className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Responsável</p>
                <p className="text-sm">{responsible?.name || "Não informado"}</p>
              </div>
            </div>
          )}
          
          {inspection?.scheduledDate && (
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data Programada</p>
                <p className="text-sm">{formatDate(inspection.scheduledDate)}</p>
              </div>
            </div>
          )}
          
          {inspection?.locationName && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Local</p>
                <p className="text-sm">{inspection.locationName}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className={`text-sm ${getStatusClass(inspection?.status)}`}>
                {getStatusText(inspection?.status)}
              </p>
            </div>
          </div>
          
          {inspection?.priority && (
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center text-gray-500">
                !
              </span>
              <div>
                <p className="text-sm font-medium">Prioridade</p>
                <p className={`text-sm ${getPriorityClass(inspection.priority)}`}>
                  {inspection.priority === "high" ? "Alta" : 
                   inspection.priority === "medium" ? "Média" : 
                   inspection.priority === "low" ? "Baixa" : "Não definida"}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
