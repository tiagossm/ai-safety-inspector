
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

interface ActionPlanFormProps {
  inspectionId: string;
  questionId: string;
  existingPlan?: {
    description: string;
    assignee: string;
    dueDate?: Date;
    priority: string;
    status: string;
  };
  onSave: (data: any) => Promise<void>;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function ActionPlanForm({
  inspectionId,
  questionId,
  existingPlan,
  onSave,
  trigger,
  onOpenChange
}: ActionPlanFormProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [description, setDescription] = useState(existingPlan?.description || '');
  const [assignee, setAssignee] = useState(existingPlan?.assignee || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(existingPlan?.dueDate);
  const [priority, setPriority] = useState(existingPlan?.priority || 'medium');
  const [status, setStatus] = useState(existingPlan?.status || 'pending');

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error("A descrição do plano de ação é obrigatória");
      return;
    }
    
    try {
      setSaving(true);
      
      await onSave({
        inspectionId,
        questionId,
        description,
        assignee,
        dueDate,
        priority,
        status,
      });
      
      toast.success("Plano de ação salvo com sucesso");
      setOpen(false);
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      console.error("Error saving action plan:", error);
      toast.error("Erro ao salvar plano de ação");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            {existingPlan ? "Editar Plano de Ação" : "Adicionar Plano de Ação"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingPlan ? "Editar Plano de Ação" : "Novo Plano de Ação"}
          </DialogTitle>
          <DialogDescription>
            Defina as ações necessárias para corrigir esta não conformidade
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição da Ação</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a ação corretiva necessária"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="assignee">Responsável</Label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Data Limite</Label>
              <DatePicker
                date={dueDate}
                setDate={setDueDate}
                showTimePicker={true}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
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
              <Select value={status} onValueChange={setStatus}>
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
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Plano de Ação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
