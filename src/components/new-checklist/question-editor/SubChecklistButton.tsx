import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ListTree } from "lucide-react";
import { useSubChecklist } from "@/hooks/new-checklist/useSubChecklist";
import { ChecklistQuestion } from "@/types/checklist";
import { toast } from "sonner";

interface SubChecklistButtonProps {
  parentQuestionId: string;
  parentQuestion?: ChecklistQuestion;
  hasSubChecklist?: boolean;
  subChecklistId?: string;
  onSubChecklistCreated?: (subChecklistId: string) => void;
  onSubChecklistRemoved?: () => void;
}

export function SubChecklistButton({
  parentQuestionId,
  parentQuestion,
  hasSubChecklist = false,
  subChecklistId,
  onSubChecklistCreated,
  onSubChecklistRemoved
}: SubChecklistButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  const {
    isCreating,
    isLoading,
    subChecklistId: fetchedSubChecklistId,
    fetchSubChecklist,
    createSubChecklist,
    removeSubChecklist
  } = useSubChecklist(parentQuestionId);

  // Inicializa o estado com o valor da prop ou busca do servidor
  useEffect(() => {
    if (subChecklistId) {
      return;
    }
    
    if (hasSubChecklist && parentQuestionId && !parentQuestionId.startsWith("new-")) {
      fetchSubChecklist(parentQuestionId);
    }
  }, [parentQuestionId, hasSubChecklist, subChecklistId, fetchSubChecklist]);

  // Determina se tem subchecklist baseado nas props ou no estado interno
  const hasSubChecklistValue = hasSubChecklist || !!subChecklistId || !!fetchedSubChecklistId;
  const effectiveSubChecklistId = subChecklistId || fetchedSubChecklistId;

  const handleCreateSubChecklist = async () => {
    if (!parentQuestion) {
      toast.error("Informações da pergunta são necessárias para criar subchecklist");
      return;
    }

    const newSubChecklistId = await createSubChecklist(title, parentQuestion);
    
    if (newSubChecklistId) {
      if (onSubChecklistCreated) {
        onSubChecklistCreated(newSubChecklistId);
      }
      setIsDialogOpen(false);
      setTitle("");
    }
  };

  const handleRemoveSubChecklist = async () => {
    setIsRemoving(true);
    try {
      const success = await removeSubChecklist();
      if (success && onSubChecklistRemoved) {
        onSubChecklistRemoved();
      }
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={hasSubChecklistValue ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => {
          if (hasSubChecklistValue) {
            // Se já tem subchecklist, navega para ele
            if (effectiveSubChecklistId) {
              window.open(`/new-checklists/${effectiveSubChecklistId}/edit`, "_blank");
            } else {
              toast.error("ID do subchecklist não encontrado");
            }
          } else {
            // Se não tem, abre diálogo para criar
            setIsDialogOpen(true);
          }
        }}
        disabled={isLoading || isCreating}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ListTree className="h-4 w-4" />
        )}
        <span>{hasSubChecklistValue ? "Ver Subitems" : "Adicionar Subitems"}</span>
      </Button>

      {hasSubChecklistValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={handleRemoveSubChecklist}
          disabled={isRemoving}
        >
          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover Subitems"}
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Subitems</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subchecklist-title">Título do Subchecklist</Label>
              <Input
                id="subchecklist-title"
                placeholder="Digite um título para o subchecklist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Se não informado, será gerado automaticamente a partir da pergunta.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateSubChecklist}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                "Criar Subitems"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

