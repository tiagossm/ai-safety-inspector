
import React from "react";
import { ChecklistsHeader } from "@/components/checklists/ChecklistsHeader";
import { ChecklistsFilterCard } from "@/components/new-checklist/ChecklistsFilterCard";
import { ChecklistsTable } from "@/components/new-checklist/ChecklistsTable";
import { ChecklistsPagination } from "@/components/new-checklist/ChecklistsPagination";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { BulkDeleteDialog } from "@/components/new-checklist/BulkDeleteDialog";
import { Separator } from "@/components/ui/separator";

interface ChecklistsContainerProps {
  search: string;
  setSearch: (search: string) => void;
  checklists: any[];
  loading: boolean;
  selectedChecklists: string[];
  isAllSelected: boolean;
  page: number;
  perPage: number;
  total: number;
  isBatchUpdating: boolean;
  isBulkDeleteDialogOpen: boolean;
  isDeleting: boolean;
  checklistToDelete: { id: string; title: string; } | null;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectChecklist: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onBatchUpdateStatus: (status: "active" | "inactive") => void;
  onDeleteDialogChange: (open: boolean) => void;
  onBulkDeleteDialogChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  onConfirmBulkDelete: () => Promise<void>; // Changed return type to Promise<void>
}

export function ChecklistsContainer({
  search,
  setSearch,
  checklists,
  loading,
  selectedChecklists,
  isAllSelected,
  page,
  perPage,
  total,
  isBatchUpdating,
  isBulkDeleteDialogOpen,
  isDeleting,
  checklistToDelete,
  setPage,
  setPerPage,
  onSelectAll,
  onSelectChecklist,
  onEdit,
  onDelete,
  onOpen,
  onBatchUpdateStatus,
  onDeleteDialogChange,
  onBulkDeleteDialogChange,
  onConfirmDelete,
  onConfirmBulkDelete
}: ChecklistsContainerProps) {
  return (
    <div className="space-y-6">
      <ChecklistsHeader />
      
      <ChecklistsFilterCard
        search={search}
        setSearch={setSearch}
        selectedChecklists={selectedChecklists}
        isBatchUpdating={isBatchUpdating}
        onBatchUpdateStatus={onBatchUpdateStatus}
      />
      
      <Separator className="my-4" />

      <ChecklistsTable
        checklists={checklists}
        isLoading={loading}
        selectedChecklists={selectedChecklists}
        isAllSelected={isAllSelected}
        onSelectAll={onSelectAll}
        onSelectChecklist={onSelectChecklist}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpen={onOpen}
      />

      <ChecklistsPagination
        perPage={perPage}
        setPerPage={setPerPage}
        page={page}
        setPage={setPage}
        total={total}
      />

      <DeleteChecklistDialog
        checklistId={checklistToDelete?.id || ""}
        checklistTitle={checklistToDelete?.title || ""}
        isOpen={!!checklistToDelete}
        onOpenChange={onDeleteDialogChange}
        onDeleted={onConfirmDelete}
        isDeleting={isDeleting}
      />
      
      <BulkDeleteDialog
        isOpen={isBulkDeleteDialogOpen}
        onOpenChange={onBulkDeleteDialogChange}
        selectedCount={selectedChecklists.length}
        isDeleting={isDeleting}
        onConfirmDelete={onConfirmBulkDelete}
      />
    </div>
  );
}
