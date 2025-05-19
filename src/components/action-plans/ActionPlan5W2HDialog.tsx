
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Definindo a interface de props
export interface ActionPlan5W2HDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId?: any; // Adicionando esta prop
  inspectionId?: string;
  existingPlan?: any;
  onSave: (data: any) => Promise<void>;
  iaSuggestions?: Record<string, any>;
  aiSuggestion?: string;
}

export function ActionPlan5W2HDialog({
  open,
  onOpenChange,
  questionId,
  inspectionId,
  existingPlan,
  onSave,
  iaSuggestions,
  aiSuggestion
}: ActionPlan5W2HDialogProps) {
  const [formData, setFormData] = useState({
    what: existingPlan?.what || '',
    why: existingPlan?.why || '',
    where: existingPlan?.where || '',
    when: existingPlan?.when || '',
    who: existingPlan?.who || '',
    how: existingPlan?.how || '',
    howMuch: existingPlan?.howMuch || ''
  });

  // Componente de demonstração simplificado para resolver o erro
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Plano de Ação 5W2H</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p>Formulário 5W2H para Plano de Ação da questão {questionId}</p>
          <p>Este é um componente temporário para resolver o erro.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)}>
            Salvar Plano
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
