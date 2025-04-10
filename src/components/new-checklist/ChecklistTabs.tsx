
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChecklistGrid } from "./ChecklistGrid";
import { ChecklistEmptyState } from "./ChecklistEmptyState";
import { ChecklistLoadingSkeleton } from "./ChecklistLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChecklistWithStats } from "@/types/newChecklist";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";

interface ChecklistTabsProps {
  checklistCounts: {
    template: number;
    active: number;
    inactive: number;
  };
  allChecklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<boolean>;
  onBulkStatusChange: (ids: string[], newStatus: "active" | "inactive") => Promise<void>;
  onTabChange: (tab: string) => void;
  activeTab: string;
  onChecklistStatusChange: (id: string, newStatus: "active" | "inactive") => Promise<boolean>;
}

export function ChecklistTabs({
  checklistCounts,
  allChecklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete,
  onBulkStatusChange,
  onTabChange,
  activeTab,
  onChecklistStatusChange
}: ChecklistTabsProps) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkActionInProgress, setIsBulkActionInProgress] = useState(false);

  const handleChecklistSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected 
        ? [...prev, id] 
        : prev.filter(item => item !== id)
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setIsBulkActionInProgress(true);
    try {
      const success = await onBulkDelete(selectedIds);
      if (success) {
        toast.success(`${selectedIds.length} checklists excluídos com sucesso`);
        setSelectedIds([]);
        await onStatusChange();
      } else {
        toast.error("Falha ao excluir checklists");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Erro ao excluir checklists");
    } finally {
      setIsBulkActionInProgress(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: "active" | "inactive") => {
    if (selectedIds.length === 0) return;
    
    setIsBulkActionInProgress(true);
    try {
      await onBulkStatusChange(selectedIds, newStatus);
      toast.success(`${selectedIds.length} checklists atualizados com sucesso`);
      setSelectedIds([]);
      await onStatusChange();
    } catch (error) {
      console.error("Error in bulk status change:", error);
      toast.error("Erro ao atualizar status dos checklists");
    } finally {
      setIsBulkActionInProgress(false);
    }
  };

  const getAppropriateEmptyMessage = (): string => {
    switch (activeTab) {
      case "template":
        return "Não há templates de checklist disponíveis. Crie um novo template para começar.";
      case "active":
        return "Não há checklists ativos disponíveis. Active um checklist ou crie um novo.";
      case "inactive":
        return "Não há checklists inativos disponíveis.";
      default:
        return "Não há checklists disponíveis. Crie um novo checklist para começar.";
    }
  };

  if (isLoading) {
    return <ChecklistLoadingSkeleton />;
  }

  return (
    <div>
      {selectedIds.length > 0 && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-background border-b py-2 px-4 flex items-center justify-between animate-in fade-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedIds.length} checklists selecionados</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Limpar seleção
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusChange("active")}
              disabled={isBulkActionInProgress}
            >
              <ToggleRight className="mr-2 h-4 w-4" />
              Ativar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusChange("inactive")}
              disabled={isBulkActionInProgress}
            >
              <ToggleLeft className="mr-2 h-4 w-4" />
              Desativar
            </Button>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBulkActionInProgress}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Excluir Checklists</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir {selectedIds.length} checklists? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isBulkActionInProgress}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isBulkActionInProgress}
                  >
                    {isBulkActionInProgress ? "Excluindo..." : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
      
      <Tabs 
        value={activeTab} 
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="template">
            Templates ({checklistCounts.template})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativos ({checklistCounts.active})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inativos ({checklistCounts.inactive})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="template">
          {allChecklists.length > 0 ? (
            <ChecklistGrid
              checklists={allChecklists.filter(c => c.is_template)}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpen={onOpen}
              onStatusChange={onChecklistStatusChange}
              onSelect={handleChecklistSelect}
              selectedIds={selectedIds}
              showCheckboxes={selectedIds.length > 0}
            />
          ) : (
            <ChecklistEmptyState message={getAppropriateEmptyMessage()} />
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {allChecklists.length > 0 ? (
            <ChecklistGrid
              checklists={allChecklists.filter(c => !c.is_template && c.status === 'active')}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpen={onOpen}
              onStatusChange={onChecklistStatusChange}
              onSelect={handleChecklistSelect}
              selectedIds={selectedIds}
              showCheckboxes={selectedIds.length > 0}
            />
          ) : (
            <ChecklistEmptyState message={getAppropriateEmptyMessage()} />
          )}
        </TabsContent>
        
        <TabsContent value="inactive">
          {allChecklists.length > 0 ? (
            <ChecklistGrid
              checklists={allChecklists.filter(c => !c.is_template && c.status === 'inactive')}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpen={onOpen}
              onStatusChange={onChecklistStatusChange}
              onSelect={handleChecklistSelect}
              selectedIds={selectedIds}
              showCheckboxes={selectedIds.length > 0}
            />
          ) : (
            <ChecklistEmptyState message={getAppropriateEmptyMessage()} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
