
import React from "react";
import { Button } from "@/components/ui/button";
import { ActionPlanForm } from "@/components/action-plans/form/ActionPlanForm";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";
import { ActionPlan } from "@/services/inspection/actionPlanService";

interface YesNoResponseInputProps {
  question: any;
  response: any;
  inspectionId?: string;
  onResponseChange: (value: any) => void;
  onMediaChange: (mediaUrls: string[]) => void;
  actionPlan?: ActionPlan;
  onSaveActionPlan?: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
  readOnly?: boolean;
}

export const YesNoResponseInput: React.FC<YesNoResponseInputProps> = ({
  question,
  response,
  inspectionId,
  onResponseChange,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}) => {
  // Obter cor de prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };
  
  // Formatar o status do plano de ação
  const formatActionPlanStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Formatar a prioridade do plano de ação
  const formatActionPlanPriority = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return priority;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          className={`px-3 py-1 rounded text-sm ${
            response?.value === 'sim' 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => !readOnly && onResponseChange('sim')}
          size="sm"
          variant={response?.value === 'sim' ? 'default' : 'outline'}
          disabled={readOnly}
        >
          Sim
        </Button>
        <Button
          className={`px-3 py-1 rounded text-sm ${
            response?.value === 'não' 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => !readOnly && onResponseChange('não')}
          size="sm"
          variant={response?.value === 'não' ? 'default' : 'outline'}
          disabled={readOnly}
        >
          Não
        </Button>
        <Button
          className={`px-3 py-1 rounded text-sm ${
            response?.value === 'n/a' 
              ? 'bg-gray-500 text-white hover:bg-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => !readOnly && onResponseChange('n/a')}
          size="sm"
          variant={response?.value === 'n/a' ? 'default' : 'outline'}
          disabled={readOnly}
        >
          N/A
        </Button>
      </div>
      
      {/* Seção de Plano de Ação para respostas negativas */}
      {response?.value === 'não' && inspectionId && question.id && (
        <div className="mt-2">
          {actionPlan ? (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  {getStatusIcon(actionPlan.status)}
                  <span className="font-medium text-sm ml-1">Plano de Ação</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(actionPlan.priority)}`}>
                    {formatActionPlanPriority(actionPlan.priority)}
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
              
              {!readOnly && (
                <div className="mt-2">
                  <ActionPlanForm
                    inspectionId={inspectionId}
                    questionId={question.id}
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
          ) : (
            !readOnly && onSaveActionPlan && (
              <ActionPlanForm
                inspectionId={inspectionId}
                questionId={question.id}
                onSave={onSaveActionPlan}
                trigger={
                  <Button variant="outline" size="sm" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                    Adicionar Plano de Ação
                  </Button>
                }
              />
            )
          )}
        </div>
      )}
      
      {/* Seção de upload de mídia se permitido */}
      {(question.allowsPhoto || question.permite_foto || 
        question.allowsVideo || question.permite_video ||
        question.allowsAudio || question.permite_audio ||
        question.allowsFiles || question.permite_files) && (
        <MediaUploadInput 
          mediaUrls={response?.mediaUrls || []}
          onMediaChange={onMediaChange}
          allowsPhoto={question.allowsPhoto || question.permite_foto}
          allowsVideo={question.allowsVideo || question.permite_video}
          allowsAudio={question.allowsAudio || question.permite_audio}
          allowsFiles={question.allowsFiles || question.permite_files}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};
