
import React from "react";
import { Button } from "@/components/ui/button";
import { ActionPlanForm } from "@/components/action-plans/form/ActionPlanForm";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";

interface ActionPlanDisplayProps {
  actionPlan: any;
  inspectionId: string;
  questionId: string;
  onSaveActionPlan?: (data: any) => Promise<void>;
  readOnly?: boolean;
}

export const ActionPlanDisplay: React.FC<ActionPlanDisplayProps> = ({
  actionPlan,
  inspectionId,
  questionId,
  onSaveActionPlan,
  readOnly = false
}) => {
  // Format action plan status
  const formatActionPlanStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  return (
    <div className="border rounded-md p-3 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {getStatusIcon(actionPlan.status)}
          <span className="font-medium text-sm ml-1">Plano de Ação</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(actionPlan.priority)}`}>
            {actionPlan.priority === 'low' ? 'Baixa' : 
             actionPlan.priority === 'medium' ? 'Média' : 
             actionPlan.priority === 'high' ? 'Alta' : 'Crítica'}
          </span>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
            {formatActionPlanStatus(actionPlan.status)}
          </span>
        </div>
      </div>
      
      <p className="text-sm mb-1">{actionPlan.description}</p>
      
      {actionPlan.assignee && (
        <p className="text-xs text-gray-600">Responsável: {actionPlan.assignee}</p>
      )}
      
      {actionPlan.due_date && (
        <p className="text-xs text-gray-600">
          Prazo: {new Date(actionPlan.due_date).toLocaleDateString()}
        </p>
      )}
      
      {!readOnly && onSaveActionPlan && (
        <div className="mt-2">
          <ActionPlanForm
            inspectionId={inspectionId}
            questionId={questionId}
            existingPlan={{
              description: actionPlan.description,
              assignee: actionPlan.assignee || '',
              dueDate: actionPlan.due_date ? new Date(actionPlan.due_date) : undefined,
              priority: actionPlan.priority,
              status: actionPlan.status
            }}
            onSave={onSaveActionPlan}
            trigger={<Button variant="outline" size="sm">Editar Plano</Button>}
          />
        </div>
      )}
    </div>
  );
};
