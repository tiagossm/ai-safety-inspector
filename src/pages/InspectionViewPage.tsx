
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInspectionView } from "@/hooks/inspection/useInspectionView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Building, User, MapPin, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function InspectionViewPage() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const { inspection, loading, error } = useInspectionView(inspectionId);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Carregando inspeção...</p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-lg text-destructive font-medium mb-4">Erro ao carregar inspeção</p>
        <Button 
          variant="outline" 
          onClick={() => navigate("/inspections")}
        >
          Voltar para Inspeções
        </Button>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Média</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Baixa</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluída</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Em andamento</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate("/inspections")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Inspeções
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Inspeção #{inspection.id.substring(0, 8)}
        </h1>
        <div className="flex gap-2">
          {getStatusBadge(inspection.status)}
          {getPriorityBadge(inspection.priority)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Inspeção</CardTitle>
            <CardDescription>
              Detalhes do checklist {inspection.checklist?.title || ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Empresa</h3>
                <p className="flex items-center text-lg font-medium">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  {inspection.companies?.fantasy_name || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">CNAE: {inspection.cnae || "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Responsável</h3>
                <p className="flex items-center text-lg font-medium">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  {inspection.metadata?.responsible_data?.name || "N/A"}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Localização</h3>
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                {inspection.location || "Localização não especificada"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Data Agendada</h3>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {inspection.scheduled_date 
                    ? format(new Date(inspection.scheduled_date), "dd/MM/yyyy HH:mm") 
                    : "Não agendada"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tipo de Inspeção</h3>
                <p className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  {inspection.inspection_type === 'internal' ? 'Interna' : 'Externa'}
                </p>
              </div>
            </div>
            
            {inspection.metadata?.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Observações</h3>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {inspection.metadata.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Status e Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Informações sobre o progresso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Criado em</h3>
              <p>
                {inspection.created_at 
                  ? format(new Date(inspection.created_at), "dd/MM/yyyy HH:mm") 
                  : "N/A"}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Última atualização</h3>
              <p>
                {inspection.updated_at 
                  ? format(new Date(inspection.updated_at), "dd/MM/yyyy HH:mm") 
                  : "N/A"}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Criado por</h3>
              <p>{inspection.users?.name || "Usuário desconhecido"}</p>
            </div>
            
            <div className="pt-4">
              <Button className="w-full mb-2">
                Executar Inspeção
              </Button>
              <Button variant="outline" className="w-full">
                Gerar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
