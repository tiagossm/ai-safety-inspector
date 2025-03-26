
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
  
  const getCompanyName = () => {
    if (!company) return "Não informada";
    if (company.name) return company.name;
    if (company.fantasy_name) return company.fantasy_name;
    if (company.razao_social) return company.razao_social;
    return "Empresa sem nome";
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{inspection?.title || "Detalhes da Inspeção"}</CardTitle>
          
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRefresh} 
              title="Atualizar dados"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Empresa</p>
              <p className="text-sm">{getCompanyName()}</p>
            </div>
          </div>
          
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
              <AlertTriangle className="h-5 w-5 text-gray-500 mt-0.5" />
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

          {inspection?.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              <p className="font-medium">Erro ao carregar dados:</p>
              <p>{inspection.error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
