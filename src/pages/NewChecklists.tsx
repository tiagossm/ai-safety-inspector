
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistsContainer } from "@/components/new-checklist/ChecklistsContainer";

// Hooks & Services
import { useLocalChecklists } from "@/hooks/new-checklist/useLocalChecklists";
import { updateBatchChecklistsStatus, deleteBatchChecklists } from "@/services/checklist/checklistBatchService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { ChecklistList } from "@/components/new-checklist/ChecklistList";
import { FileText, List, Grid, BarChart2 } from "lucide-react";

export default function NewChecklists() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<string>("title");
  const [isDeleting, setIsDeleting] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "analytics">("grid");

  // Fetch checklists
  const { checklists, loading, error, total, refetch } = useLocalChecklists({
    search,
    page,
    perPage,
    sort,
    sortColumn,
  });

  // Event handlers
  const handleOpenChecklist = (id: string) => {
    navigate(`/new-checklists/${id}`);
  };

  const handleEditChecklist = (id: string) => {
    navigate(`/new-checklists/${id}/edit`);
  };

  const handleDeleteChecklist = async (id: string, title: string) => {
    setChecklistToDelete({ id, title });
  };

  const confirmDeleteChecklist = async (): Promise<void> => {
    if (!checklistToDelete) return Promise.resolve();

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistToDelete.id);

      if (error) {
        console.error("Error deleting checklist:", error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir checklist",
          description: error.message,
        });
        return Promise.resolve();
      }

      toast({
        title: "Checklist excluído com sucesso!",
        description: `O checklist "${checklistToDelete.title}" foi excluído.`,
      });
      refetch();
    } finally {
      setIsDeleting(false);
      setChecklistToDelete(null);
    }
    return Promise.resolve();
  };

  const handleSelectChecklist = (id: string, selected: boolean) => {
    setSelectedChecklists((prev) =>
      selected
        ? [...prev, id]
        : prev.filter((checklistId) => checklistId !== id)
    );
  };

  const handleSelectAllChecklists = (checked: boolean) => {
    setIsAllSelected(checked);
    setSelectedChecklists(checked ? checklists.map((c) => c.id) : []);
  };

  const handleBulkDelete = async () => {
    if (selectedChecklists.length === 0) return;
    setIsBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async (): Promise<void> => {
    if (selectedChecklists.length === 0) return;

    setIsDeleting(true);
    try {
      const success = await deleteBatchChecklists(selectedChecklists);
      
      if (success) {
        setSelectedChecklists([]);
        setIsAllSelected(false);
        refetch();
      }
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteDialogOpen(false);
    }
  };

  const handleBatchUpdateStatus = async (newStatus: "active" | "inactive") => {
    if (selectedChecklists.length === 0) {
      toast({
        title: "Nenhum checklist selecionado",
        description: "Selecione pelo menos um checklist para alterar o status.",
      });
      return;
    }

    setIsBatchUpdating(true);
    try {
      await updateBatchChecklistsStatus(selectedChecklists, newStatus);
      refetch();
      toast({
        title: "Status atualizado",
        description: `${selectedChecklists.length} checklists foram atualizados para ${newStatus === "active" ? "ativo" : "inativo"}.`,
      });
    } finally {
      setIsBatchUpdating(false);
      setSelectedChecklists([]);
      setIsAllSelected(false);
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
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleBulkDelete}
            disabled={selectedChecklists.length === 0}
          >
            Excluir selecionados ({selectedChecklists.length})
          </Button>
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
        search={search}
        setSearch={setSearch}
        selectedChecklists={selectedChecklists}
        onBatchUpdateStatus={handleBatchUpdateStatus}
        isBatchUpdating={isBatchUpdating}
        sortColumn={sortColumn}
        setSortColumn={setSortColumn}
        sort={sort}
        setSort={setSort}
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
              isLoading={loading}
              onEdit={handleEditChecklist}
              onDelete={handleDeleteChecklist}
              onOpen={handleOpenChecklist}
              onStatusChange={refetch}
              onBulkDelete={confirmBulkDelete}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <ChecklistList 
            checklists={checklists}
            isLoading={loading}
            onEdit={handleEditChecklist}
            onDelete={handleDeleteChecklist}
            onOpen={handleOpenChecklist}
            onStatusChange={refetch}
            onBulkStatusChange={handleBatchUpdateStatus}
            onBulkDelete={handleBulkDelete}
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
      
      <AlertDialog 
        open={checklistToDelete !== null} 
        onOpenChange={(open) => !open && setChecklistToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir o checklist "{checklistToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteChecklist} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog 
        open={isBulkDeleteDialogOpen} 
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklists selecionados</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir {selectedChecklists.length} checklists?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Importações que precisamos adicionar
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
