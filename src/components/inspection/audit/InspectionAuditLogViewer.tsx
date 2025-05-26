
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  User, 
  FileText, 
  Edit, 
  Plus, 
  Trash2, 
  AlertCircle,
  Camera,
  MessageSquare,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useInspectionAuditLogs } from "@/hooks/inspection/useInspectionAuditLogs";

interface InspectionAuditLogViewerProps {
  inspectionId: string;
}

export function InspectionAuditLogViewer({ inspectionId }: InspectionAuditLogViewerProps) {
  const { logs, loading, error } = useInspectionAuditLogs(inspectionId);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create_response":
        return <Plus className="h-4 w-4" />;
      case "edit_response":
        return <Edit className="h-4 w-4" />;
      case "edit_comment":
        return <MessageSquare className="h-4 w-4" />;
      case "edit_action_plan":
        return <ClipboardList className="h-4 w-4" />;
      case "add_media":
      case "edit_media":
        return <Camera className="h-4 w-4" />;
      case "change_status":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "create_response":
        return "bg-green-100 text-green-800 border-green-200";
      case "edit_response":
      case "edit_comment":
      case "edit_action_plan":
      case "edit_media":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "add_media":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "change_status":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      create_response: "Resposta Criada",
      edit_response: "Resposta Editada",
      edit_comment: "Comentário Editado",
      edit_action_plan: "Plano de Ação Editado",
      add_media: "Mídia Adicionada",
      edit_media: "Mídia Editada",
      change_status: "Status Alterado",
      edit_location: "Localização Editada",
      edit_metadata: "Metadados Editados",
      edit_notes: "Notas Editadas"
    };
    return labels[actionType] || actionType;
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return `${value.length} item(s)`;
    return JSON.stringify(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar histórico de auditoria: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Auditoria
          <Badge variant="secondary">{logs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum registro de auditoria encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={`${getActionColor(log.action_type)} flex items-center gap-1`}
                    >
                      {getActionIcon(log.action_type)}
                      {getActionLabel(log.action_type)}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="h-3 w-3" />
                      <span>Usuário: {log.user_id}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR
                        })}
                      </span>
                    </div>
                    
                    {log.changed_field && (
                      <div className="text-sm mb-2">
                        <span className="font-medium">Campo:</span> {log.changed_field}
                      </div>
                    )}
                    
                    {(log.previous_value !== null || log.new_value !== null) && (
                      <div className="text-xs space-y-1">
                        {log.previous_value !== null && (
                          <div>
                            <span className="font-medium text-red-600">Anterior:</span>{" "}
                            <span className="text-muted-foreground">
                              {formatValue(log.previous_value)}
                            </span>
                          </div>
                        )}
                        {log.new_value !== null && (
                          <div>
                            <span className="font-medium text-green-600">Novo:</span>{" "}
                            <span className="text-muted-foreground">
                              {formatValue(log.new_value)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {log.question_id && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Questão ID:</span> {log.question_id}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
