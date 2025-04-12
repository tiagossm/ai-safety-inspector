import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistsContainer } from "@/components/new-checklist/ChecklistsContainer";

// Hooks & Services
import { useLocalChecklists } from "@/hooks/new-checklist/useLocalChecklists";
import { updateBatchChecklistsStatus, deleteBatchChecklists } from "@/services/checklist/checklistBatchService";

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
      const { data, error } = await supabase
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
    } finally {
      setIsBatchUpdating(false);
      setSelectedChecklists([]);
      setIsAllSelected(false);
    }
  };

  return (
    <ChecklistsContainer
      search={search}
      setSearch={setSearch}
      checklists={checklists}
      loading={loading}
      selectedChecklists={selectedChecklists}
      isAllSelected={isAllSelected}
      page={page}
      perPage={perPage}
      total={total}
      isBatchUpdating={isBatchUpdating}
      isBulkDeleteDialogOpen={isBulkDeleteDialogOpen}
      isDeleting={isDeleting}
      checklistToDelete={checklistToDelete}
      setPage={setPage}
      setPerPage={setPerPage}
      onSelectAll={handleSelectAllChecklists}
      onSelectChecklist={handleSelectChecklist}
      onEdit={handleEditChecklist}
      onDelete={handleDeleteChecklist}
      onOpen={handleOpenChecklist}
      onBatchUpdateStatus={handleBatchUpdateStatus}
      onDeleteDialogChange={(open) => open ? null : setChecklistToDelete(null)}
      onBulkDeleteDialogChange={setIsBulkDeleteDialogOpen}
      onConfirmDelete={confirmDeleteChecklist}
      onConfirmBulkDelete={confirmBulkDelete}
    />
  );
}
