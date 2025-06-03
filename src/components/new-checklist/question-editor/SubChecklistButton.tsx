
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SubChecklistButtonProps {
  parentQuestionId: string;
  hasSubChecklist: boolean;
  subChecklistId?: string;
  onSubChecklistCreated: (subChecklistId: string) => void;
}

export function SubChecklistButton({
  parentQuestionId,
  hasSubChecklist,
  subChecklistId,
  onSubChecklistCreated
}: SubChecklistButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [subChecklistTitle, setSubChecklistTitle] = useState("");
  const [subChecklistDescription, setSubChecklistDescription] = useState("");

  const handleCreateSubChecklist = async () => {
    if (!subChecklistTitle.trim()) {
      toast.error("Título do sub-checklist é obrigatório");
      return;
    }

    setIsCreating(true);
    
    try {
      // Simular criação do sub-checklist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSubChecklistId = `sub-${Date.now()}`;
      
      // Salvar informações do sub-checklist no localStorage para simulação
      const subChecklistData = {
        id: newSubChecklistId,
        title: subChecklistTitle,
        description: subChecklistDescription,
        parentQuestionId,
        createdAt: new Date().toISOString()
      };
      
      const existingSubChecklists = JSON.parse(localStorage.getItem('subChecklists') || '[]');
      existingSubChecklists.push(subChecklistData);
      localStorage.setItem('subChecklists', JSON.stringify(existingSubChecklists));
      
      onSubChecklistCreated(newSubChecklistId);
      setIsDialogOpen(false);
      setSubChecklistTitle("");
      setSubChecklistDescription("");
      
      toast.success("Sub-checklist criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar sub-checklist:", error);
      toast.error("Erro ao criar sub-checklist");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSubChecklist = () => {
    toast.info("Função de edição de sub-checklist será implementada em breve");
  };

  if (hasSubChecklist && subChecklistId) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleEditSubChecklist}
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <FileCheck className="h-4 w-4 mr-2" />
        Editar Sub-checklist
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Sub-checklist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Sub-checklist</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              value={subChecklistTitle}
              onChange={(e) => setSubChecklistTitle(e.target.value)}
              className="col-span-3"
              placeholder="Nome do sub-checklist"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={subChecklistDescription}
              onChange={(e) => setSubChecklistDescription(e.target.value)}
              className="col-span-3"
              placeholder="Descrição opcional"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCreateSubChecklist}
            disabled={isCreating || !subChecklistTitle.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Criar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
