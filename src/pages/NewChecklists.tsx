
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChecklistsContainer } from "@/components/new-checklist/ChecklistsContainer";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { ChecklistList } from "@/components/new-checklist/ChecklistList";
import { useNewChecklists } from "@/hooks/new-checklist/useNewChecklists";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";

export default function NewChecklists() {
  const navigate = useNavigate();
  const {
    checklists,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCategory,
    setSelectedCategory,
    selectedOrigin,
    setSelectedOrigin,
    sortOrder,
    setSortOrder,
    companies,
    categories,
    deleteChecklist,
    updateStatus,
    updateBulkStatus,
    deleteBulkChecklists,
    refetch
  } = useNewChecklists();
  
  // State
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "analytics">("grid");

  // Event handlers
  const handleOpenChecklist = (id: string) => {
    navigate(`/new-checklists/${id}`);
  };

  const handleEditChecklist = (id: string) => {
    // Corrigindo a navegação para a página de edição
    navigate(`/new-checklists/${id}/edit`);
  };

  const handleDeleteChecklist = (id: string, title: string) => {
    setChecklistToDelete({ id, title });
  };

  const confirmDeleteChecklist = async (): Promise<void> => {
    if (!checklistToDelete) return Promise.resolve();

    setIsDeleting(true);
    try {
      await deleteChecklist.mutateAsync(checklistToDelete.id);
      refetch(); // Atualiza a lista após excluir
    } catch (error) {
      console.error("Error deleting checklist:", error);
      toast.error("Erro ao excluir checklist");
    } finally {
      setIsDeleting(false);
      setChecklistToDelete(null);
    }
    return Promise.resolve();
  };

  const handleBulkDelete = async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return;

    try {
      await deleteBulkChecklists.mutateAsync(ids);
      refetch(); // Atualiza a lista após excluir
      return Promise.resolve();
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Erro ao excluir checklists em massa");
      throw error;
    }
  };

  const handleBatchUpdateStatus = async (ids: string[], newStatus: "active" | "inactive") => {
    if (ids.length === 0) {
      toast.warning("Nenhum checklist selecionado");
      return;
    }

    try {
      await updateBulkStatus.mutateAsync({ checklistIds: ids, newStatus });
      refetch();
      toast.success(`${ids.length} checklists atualizados para ${newStatus === "active" ? "ativo" : "inativo"}`);
    } catch (error) {
      console.error("Error updating status in batch:", error);
      toast.error("Erro ao atualizar status em massa");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checklists</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas listas de verificação e acompanhe seu progresso
          </p>
        </div>
        
        <div className="flex gap-2 self-end sm:self-auto">
          <Button 
            onClick={() => navigate("/new-checklists/create")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Checklist
          </Button>
        </div>
      </div>

      <ChecklistFilters 
        search={searchTerm}
        setSearch={setSearchTerm}
        selectedChecklists={selectedChecklists}
        onBatchUpdateStatus={(newStatus) => handleBatchUpdateStatus(selectedChecklists, newStatus)}
        isBatchUpdating={updateBulkStatus.isPending}
        sortColumn={sortOrder.split('_')[0]}
        setSortColumn={(col) => setSortOrder(`${col}_${sortOrder.split('_')[1]}`)}
        sort={sortOrder.split('_')[1] as 'asc' | 'desc'}
        setSort={(dir) => setSortOrder(`${sortOrder.split('_')[0]}_${dir}`)}
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedOrigin={selectedOrigin}
        setSelectedOrigin={setSelectedOrigin}
        companies={companies}
        categories={categories}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list" | "analytics")} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              <span>Cartões</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Análise</span>
            </TabsTrigger>
          </TabsList>
          
          <p className="text-sm text-muted-foreground">
            {checklists.length} {checklists.length === 1 ? 'checklist' : 'checklists'} encontrados
          </p>
        </div>

        <TabsContent value="grid" className="m-0">
          <ScrollArea className="h-[calc(100vh-310px)]">
            <ChecklistGrid 
              checklists={checklists}
              isLoading={isLoading}
              onEdit={handleEditChecklist}
              onDelete={handleDeleteChecklist}
              onOpen={handleOpenChecklist}
              onStatusChange={refetch}
              onBulkDelete={handleBulkDelete}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <ChecklistList 
            checklists={checklists}
            isLoading={isLoading}
            onEdit={handleEditChecklist}
            onDelete={handleDeleteChecklist}
            onOpen={handleOpenChecklist}
            onStatusChange={refetch}
            onBulkStatusChange={handleBatchUpdateStatus}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="m-0">
          <div className="bg-muted/20 border rounded-lg p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Análise de Checklists</h3>
            <p className="text-muted-foreground mb-4">
              Visualize dados e métricas sobre seus checklists nesta seção.
            </p>
            <p className="text-sm text-muted-foreground">
              Em desenvolvimento...
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de exclusão individual */}
      <DeleteChecklistDialog 
        checklistId={checklistToDelete?.id || ""}
        checklistTitle={checklistToDelete?.title || ""}
        isOpen={checklistToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setChecklistToDelete(null);
        }}
        onDeleted={confirmDeleteChecklist}
        isDeleting={isDeleting}
      />
    </div>
  );
}
