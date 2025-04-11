
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Check, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "in-progress";
  priority: "critical" | "high" | "medium" | "low";
  area: "creation" | "editing" | "subitems" | "execution" | "saving";
}

export function TechnicalActionPlanReport() {
  const actions: ActionItem[] = [
    {
      id: "1",
      title: "Melhorar visualização de relações pai-filho",
      description: "Adicionar indicadores visuais claros para perguntas aninhadas e condicionais",
      status: "completed",
      priority: "high",
      area: "subitems"
    },
    {
      id: "2",
      title: "Implementar indicador de salvamento",
      description: "Adicionar feedback visual para operações de salvamento automático e manual",
      status: "completed",
      priority: "high",
      area: "saving"
    },
    {
      id: "3",
      title: "Melhorar componente de plano de ação",
      description: "Adicionar validação, contagem de caracteres e indicação clara de campos obrigatórios",
      status: "completed",
      priority: "medium",
      area: "execution"
    },
    {
      id: "4",
      title: "Garantir registro consistente da origem do checklist",
      description: "Implementar campos de origem consistentes (manual, ia, csv) em todos os métodos de criação",
      status: "completed",
      priority: "high",
      area: "creation"
    },
    {
      id: "5",
      title: "Melhorar diferenciação de modo template vs. documento único",
      description: "Tornar mais claro quando um checklist é um template reutilizável ou um documento único",
      status: "completed",
      priority: "medium",
      area: "editing"
    },
    {
      id: "6",
      title: "Implementar validações em tempo real",
      description: "Adicionar feedback imediato sobre campos obrigatórios e validações durante o preenchimento",
      status: "completed",
      priority: "medium",
      area: "execution"
    },
    {
      id: "7",
      title: "Refinar UX para requisitos de inspeção",
      description: "Melhorar o fluxo de validação e finalização de inspeções, destacando requisitos não cumpridos",
      status: "completed", 
      priority: "high",
      area: "execution"
    },
    {
      id: "8",
      title: "Melhorar tratamento de erros no processo de importação",
      description: "Implementar melhor feedback sobre erros na importação de planilhas",
      status: "in-progress",
      priority: "medium",
      area: "creation"
    },
    {
      id: "9",
      title: "Aprimorar o gerenciamento de estado para questionários grandes",
      description: "Otimizar o desempenho e a experiência do usuário ao lidar com questionários extensos",
      status: "pending",
      priority: "medium",
      area: "execution"
    },
    {
      id: "10",
      title: "Implementar drag-and-drop para reordenar perguntas em grupo",
      description: "Facilitar a reorganização de perguntas dentro de grupos no editor de checklist",
      status: "pending",
      priority: "low",
      area: "editing"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-amber-100 text-amber-800 border-amber-200";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "completed": return <Check className="h-4 w-4 text-green-500" />;
      case "in-progress": return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default: return null;
    }
  };

  const getAreaColor = (area: string) => {
    switch(area) {
      case "creation": return "bg-purple-100 text-purple-800 border-purple-200";
      case "editing": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "subitems": return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "execution": return "bg-orange-100 text-orange-800 border-orange-200";
      case "saving": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Group actions by status
  const completedActions = actions.filter(a => a.status === "completed");
  const inProgressActions = actions.filter(a => a.status === "in-progress");
  const pendingActions = actions.filter(a => a.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano de Ação Técnico</CardTitle>
        <CardDescription>
          Status de implementação das melhorias no fluxo de checklists
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Implementado ({completedActions.length})</span>
            </h3>
            <div className="space-y-3">
              {completedActions.map(action => (
                <div key={action.id} className="p-3 border rounded-md bg-gray-50">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{action.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getAreaColor(action.area)}>
                        {action.area}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {inProgressActions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Em Andamento ({inProgressActions.length})</span>
              </h3>
              <div className="space-y-3">
                {inProgressActions.map(action => (
                  <div key={action.id} className="p-3 border rounded-md bg-gray-50">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{action.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getAreaColor(action.area)}>
                          {action.area}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingActions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>Pendente ({pendingActions.length})</span>
              </h3>
              <div className="space-y-3">
                {pendingActions.map(action => (
                  <div key={action.id} className="p-3 border rounded-md bg-gray-50">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{action.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getAreaColor(action.area)}>
                          {action.area}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
