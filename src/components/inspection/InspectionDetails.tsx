
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, User2, MapPin, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface InspectionDetailsCardProps {
  loading: boolean;
  inspection: any;
  company: any;
  responsible: any;
  onRefresh?: () => Promise<void>;
}

export function InspectionDetailsCard({ 
  loading, 
  inspection, 
  company, 
  responsible,
  onRefresh
}: InspectionDetailsCardProps) {
  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-1 px-4 pt-4">
          <CardTitle className="text-base font-medium">
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
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
      case "high": return "text-red-500";
      case "medium": return "text-amber-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };
  
  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "completed": return "text-green-500";
      case "in_progress": return "text-blue-500";
      case "pending": return "text-amber-500";
      default: return "text-gray-500";
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
  
  const getCompanyName = () => {
    if (!company) return "Não informada";
    if (company.name) return company.name;
    if (company.fantasy_name) return company.fantasy_name;
    if (company.razao_social) return company.razao_social;
    return "Empresa sem nome";
  };
  
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-1 px-4 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium text-gray-800">
            {inspection?.title || "Detalhes da Inspeção"}
          </CardTitle>
          
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRefresh} 
              title="Atualizar dados"
              className="h-7 w-7"
            >
              <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2.5">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-600">Empresa</p>
              <p className="text-sm">{getCompanyName()}</p>
            </div>
          </div>
          
          {responsible && (
            <div className="flex items-start gap-2">
              <User2 className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-600">Responsável</p>
                <p className="text-sm">{responsible?.name || "Não informado"}</p>
              </div>
            </div>
          )}
          
          {inspection?.scheduledDate && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-600">Data Programada</p>
                <p className="text-sm">{formatDate(inspection.scheduledDate)}</p>
              </div>
            </div>
          )}
          
          {inspection?.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-600">Local</p>
                <p className="text-sm">{inspection.location}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-600">Status</p>
              <p className={`text-sm ${getStatusClass(inspection?.status)}`}>
                {getStatusText(inspection?.status)}
              </p>
            </div>
          </div>
          
          {inspection?.priority && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-600">Prioridade</p>
                <p className={`text-sm ${getPriorityClass(inspection.priority)}`}>
                  {inspection.priority === "high" ? "Alta" : 
                   inspection.priority === "medium" ? "Média" : 
                   inspection.priority === "low" ? "Baixa" : "Não definida"}
                </p>
              </div>
            </div>
          )}

          {inspection?.error && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded text-red-600 text-xs">
              <p className="font-medium">Erro ao carregar dados:</p>
              <p className="leading-relaxed">{inspection.error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
