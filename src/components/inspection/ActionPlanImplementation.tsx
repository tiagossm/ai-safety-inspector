
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  Loader2,
  CalendarIcon,
  User,
  AlertTriangle,
  Clock,
  FileText
} from "lucide-react";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { ActionPlanDialog } from "@/components/action-plans/ActionPlanDialog";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { format } from "date-fns";

interface ActionPlanImplementationProps {
  inspectionId: string;
  questionId: string;
  questionText: string;
  actionPlans: ActionPlan[];
  loading: boolean;
  onSaveActionPlan: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
  aiSuggestions?: string[];
}

export function ActionPlanImplementation({
  inspectionId,
  questionId,
  questionText,
  actionPlans,
  loading,
  onSaveActionPlan,
  aiSuggestions = []
}: ActionPlanImplementationProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get the most recent action plan if it exists
  const latestPlan = actionPlans.length > 0 
    ? actionPlans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatPriority = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return priority;
    }
  };

  const handleSaveActionPlan = async (data: ActionPlanFormData) => {
    await onSaveActionPlan({
      ...data,
      inspectionId,
      questionId
    });
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="history">Histórico ({actionPlans.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {latestPlan ? "Plano de Ação Atual" : "Criar Plano de Ação"}
              </CardTitle>
              <CardDescription>
                {latestPlan 
                  ? "Detalhes do plano de ação atual para esta não conformidade" 
                  : "Nenhum plano de ação foi criado para esta não conformidade"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestPlan ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium flex items-center">
                        {getStatusIcon(latestPlan.status)}
                        <span className="ml-1">{formatStatus(latestPlan.status)}</span>
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 ${getPriorityColor(latestPlan.priority)}`}
                      >
                        {formatPriority(latestPlan.priority)}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDialogOpen(true)}
                    >
                      Editar Plano
                    </Button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm">{latestPlan.description}</p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {latestPlan.assignee && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5 mr-1" />
                          <span>{latestPlan.assignee}</span>
                        </div>
                      )}
                      
                      {latestPlan.due_date && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{format(new Date(latestPlan.due_date), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle className="mx-auto h-12 w-12 text-amber-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">Nenhum Plano de Ação</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Crie um plano de ação para resolver esta não conformidade e
                    acompanhar o progresso das correções.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    Criar Plano de Ação
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {aiSuggestions.length > 0 && (
            <Card className="mt-4 bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 text-lg flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Sugestões da IA
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Sugestões baseadas na análise de dados e imagens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-white rounded border border-amber-200">
                      <p className="text-sm mb-2">{suggestion}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300"
                        onClick={() => {
                          setDialogOpen(true);
                        }}
                      >
                        Usar esta sugestão
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Histórico de Planos de Ação</CardTitle>
              <CardDescription>
                {actionPlans.length === 0 
                  ? "Nenhum histórico de planos de ação para esta não conformidade" 
                  : `${actionPlans.length} planos de ação criados para esta não conformidade`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionPlans.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">Sem Histórico</h3>
                  <p className="text-muted-foreground mb-4">
                    Nenhum plano de ação foi criado para este item.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    Criar Primeiro Plano
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {actionPlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className="p-3 border rounded-md bg-gray-50 hover:bg-white transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {getStatusIcon(plan.status)}
                          <span className="ml-1 font-medium text-sm">
                            {formatStatus(plan.status)}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getPriorityColor(plan.priority)}`}
                        >
                          {formatPriority(plan.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm mt-2">{plan.description}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        {plan.created_at && (
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            <span>Criado em: {format(new Date(plan.created_at), 'dd/MM/yyyy')}</span>
                          </div>
                        )}
                        
                        {plan.assignee && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>{plan.assignee}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ActionPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        inspectionId={inspectionId}
        questionId={questionId}
        existingPlan={latestPlan || undefined}
        onSave={handleSaveActionPlan}
        aiSuggestion={aiSuggestions.length > 0 ? aiSuggestions[0] : undefined}
      />
    </div>
  );
}
