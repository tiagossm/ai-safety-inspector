
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, AlertCircle } from "lucide-react";
import { ActionPlanFormData } from "./form/types";
import { ActionPlan } from "@/services/inspection/actionPlanService";

interface ActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: string;
  questionId: string;
  existingPlan?: ActionPlan;
  onSave: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
  aiSuggestion?: string | null;
}

type PriorityType = 'low' | 'medium' | 'high' | 'critical';
type StatusType = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export function ActionPlanDialog({
  open,
  onOpenChange,
  inspectionId,
  questionId,
  existingPlan,
  onSave,
  aiSuggestion
}: ActionPlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(existingPlan?.description || "");
  const [priority, setPriority] = useState<PriorityType>(
    (existingPlan?.priority as PriorityType) || "medium"
  );
  const [status, setStatus] = useState<StatusType>(
    (existingPlan?.status as StatusType) || "pending"
  );
  const [assignee, setAssignee] = useState(existingPlan?.assignee || "");
  const [dueDate, setDueDate] = useState<string>(
    existingPlan?.due_date 
      ? new Date(existingPlan.due_date).toISOString().split("T")[0]
      : ""
  );

  // Reset form when dialog opens/closes or when existingPlan changes
  useEffect(() => {
    if (open && existingPlan) {
      setDescription(existingPlan.description || "");
      setPriority((existingPlan.priority as PriorityType) || "medium");
      setStatus((existingPlan.status as StatusType) || "pending");
      setAssignee(existingPlan.assignee || "");
      setDueDate(
        existingPlan.due_date 
          ? new Date(existingPlan.due_date).toISOString().split("T")[0]
          : ""
      );
    } else if (open && !existingPlan) {
      // Reset to defaults for new action plan
      setDescription("");
      setPriority("medium");
      setStatus("pending");
      setAssignee("");
      setDueDate("");
      
      // Aplicar sugestão da IA se disponível
      if (aiSuggestion) {
        setDescription(aiSuggestion);
      }
    }
  }, [open, existingPlan, aiSuggestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("ActionPlanDialog: Submitting plan with priority:", priority, "and status:", status);

    try {
      const data: ActionPlanFormData = {
        id: existingPlan?.id,
        inspectionId,
        questionId,
        description,
        priority: priority as "low" | "medium" | "high" | "critical",
        status: status as "pending" | "in_progress" | "completed" | "cancelled",
        assignee: assignee || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined
      };

      console.log("ActionPlanDialog: Submitting data:", data);
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error("ActionPlanDialog: Failed to save action plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      console.log("ActionPlanDialog: Applying AI suggestion:", aiSuggestion);
      setDescription(aiSuggestion);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="action-plan-dialog-description">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{existingPlan ? "Editar Plano de Ação" : "Criar Plano de Ação"}</DialogTitle>
            <DialogDescription>
              {existingPlan 
                ? "Atualize os detalhes do plano de ação abaixo."
                : "Adicione detalhes para o novo plano de ação."}
            </DialogDescription>
          </DialogHeader>
          
          {aiSuggestion && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center mb-2">
                <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                <h4 className="text-sm font-medium text-amber-700">Sugestão da IA</h4>
              </div>
              <p className="text-sm mb-3 text-amber-800">{aiSuggestion}</p>
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300"
                onClick={applyAiSuggestion}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Aplicar esta sugestão
              </Button>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva as ações necessárias..."
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={priority} 
                  onValueChange={(value) => setPriority(value as PriorityType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setStatus(value as StatusType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="assignee">Responsável (opcional)</Label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Quem é responsável por esta ação"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Data de Vencimento (opcional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : existingPlan ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
