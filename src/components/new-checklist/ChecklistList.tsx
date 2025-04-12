
import React, { useState, useMemo } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChecklistRow } from "./ChecklistRow";
import { CheckCircle, XCircle, Trash2, RefreshCw, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChecklistListProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
  onBulkStatusChange: (ids: string[], newStatus: 'active' | 'inactive') => Promise<void>;
  onBulkDelete?: (ids: string[]) => void;
}

export function ChecklistList({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkStatusChange,
  onBulkDelete
}: ChecklistListProps) {
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'status'>('delete');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChecklists(checklists.map(c => c.id));
    } else {
      setSelectedChecklists([]);
    }
  };

  const handleSelectChecklist = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedChecklists([...selectedChecklists, id]);
    } else {
      setSelectedChecklists(selectedChecklists.filter(checklistId => checklistId !== id));
    }
  };

  const handleBulkDelete = () => {
    setBulkActionType('delete');
    setIsConfirmDialogOpen(true);
  };

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    setBulkActionType('status');
    setNewStatus(status);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmBulkAction = async () => {
    if (selectedChecklists.length === 0) return;
    
    setIsProcessing(true);
    try {
      if (bulkActionType === 'delete') {
        if (onBulkDelete) {
          await onBulkDelete(selectedChecklists);
        }
      } else {
        await onBulkStatusChange(selectedChecklists, newStatus);
      }
      setSelectedChecklists([]);
    } finally {
      setIsProcessing(false);
      setIsConfirmDialogOpen(false);
    }
  };

  const dialogContent = useMemo(() => {
    if (bulkActionType === 'delete') {
      return {
        title: "Excluir checklists selecionados",
        description: `Tem certeza que deseja excluir ${selectedChecklists.length} checklists? Esta ação não pode ser desfeita.`,
        action: "Excluir"
      };
    } else {
      return {
        title: `${newStatus === 'active' ? 'Ativar' : 'Desativar'} checklists selecionados`,
        description: `Tem certeza que deseja ${newStatus === 'active' ? 'ativar' : 'desativar'} ${selectedChecklists.length} checklists?`,
        action: newStatus === 'active' ? "Ativar" : "Desativar"
      };
    }
  }, [bulkActionType, newStatus, selectedChecklists.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando checklists...</p>
        </div>
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl border-dashed">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground mb-6">
          Não foram encontrados checklists com os filtros atuais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedChecklists.length > 0 && (
        <div className="bg-background border rounded-lg shadow-sm p-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedChecklists.length} {selectedChecklists.length === 1 ? 'checklist selecionado' : 'checklists selecionados'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusChange('active')}
              disabled={isProcessing}
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Ativar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusChange('inactive')}
              disabled={isProcessing}
              className="gap-1"
            >
              <XCircle className="h-4 w-4 text-amber-500" />
              <span>Desativar</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedChecklists.length === checklists.length && checklists.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Checklist</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Criado por</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklists.map((checklist) => (
              <ChecklistRow
                key={checklist.id}
                checklist={checklist}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpen={onOpen}
                onStatusChange={onStatusChange}
                isSelected={selectedChecklists.includes(checklist.id)}
                onSelect={(checked) => handleSelectChecklist(checklist.id, checked)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkAction}
              disabled={isProcessing}
              className={bulkActionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isProcessing ? "Processando..." : dialogContent.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
