
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, FileText, Archive, CheckSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNewChecklists } from "@/hooks/new-checklist/useNewChecklists";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { ChecklistList } from "@/components/new-checklist/ChecklistList";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

export default function NewChecklists() {
  const navigate = useNavigate();
  const { 
    checklists, 
    allChecklists,
    isLoading,
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
    companies,
    categories,
    isLoadingCompanies,
    refetch,
    deleteChecklist
  } = useNewChecklists();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    checklistId: string;
    checklistTitle: string;
    isMultiple: boolean;
    selectedIds: string[];
  }>({
    open: false,
    checklistId: "",
    checklistTitle: "",
    isMultiple: false,
    selectedIds: []
  });
  
  const [isDeleting, setIsDeleting] = useState(false);

  // Count checklists by type - excluding subchecklist
  const filteredChecklists = allChecklists.filter(c => !c.isSubChecklist);
  const counts = {
    all: filteredChecklists.length,
    active: filteredChecklists.filter(c => c.status === "active" && !c.isTemplate).length,
    inactive: filteredChecklists.filter(c => c.status === "inactive" && !c.isTemplate).length,
    template: filteredChecklists.filter(c => c.isTemplate).length
  };

  const handleOpenChecklist = (id: string) => {
    console.log(`Opening checklist: ${id}`);
    navigate(`/new-checklists/${id}`);
  };

  const handleEdit = (id: string) => {
    console.log(`Editing checklist: ${id}`);
    navigate(`/new-checklists/edit/${id}`);
  };

  const handleDelete = (id: string, title: string) => {
    console.log(`Preparing to delete checklist: ${id} (${title})`);
    setDeleteDialog({
      open: true,
      checklistId: id,
      checklistTitle: title,
      isMultiple: false,
      selectedIds: []
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    console.log(`Preparing to delete ${ids.length} checklists`);
    setDeleteDialog({
      open: true,
      checklistId: "",
      checklistTitle: `${ids.length} checklists selecionados`,
      isMultiple: true,
      selectedIds: ids
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteDialog.isMultiple) {
        // Bulk delete
        for (const id of deleteDialog.selectedIds) {
          await deleteChecklist.mutateAsync(id);
        }
        toast.success(`${deleteDialog.selectedIds.length} checklists excluídos com sucesso`);
      } else {
        // Single delete
        await deleteChecklist.mutateAsync(deleteDialog.checklistId);
        toast.success("Checklist excluído com sucesso");
      }
      
      // Important: refetch data after deletion
      await refetch();
      
      setDeleteDialog({
        open: false,
        checklistId: "",
        checklistTitle: "",
        isMultiple: false,
        selectedIds: []
      });
    } catch (error: any) {
      console.error("Error deleting checklist(s):", error);
      toast.error(`Erro ao excluir: ${error.message || "Falha na operação"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNew = () => {
    navigate("/new-checklists/create");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Checklists</h1>
      </div>

      <ChecklistFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        companies={companies}
        categories={categories}
        isLoadingCompanies={isLoadingCompanies}
        totalChecklists={filteredChecklists.length}
        onCreateNew={handleCreateNew}
      />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Clipboard className="h-4 w-4" />
            <span>Todos</span>
            {counts.all > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{counts.all}</span>}
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
            {counts.template > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{counts.template}</span>}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Ativos</span>
            {counts.active > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{counts.active}</span>}
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span>Inativos</span>
            {counts.inactive > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{counts.inactive}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ChecklistList 
            checklists={filteredChecklists} 
            isLoading={isLoading} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpen={handleOpenChecklist}
            onStatusChange={refetch}
            onBulkDelete={handleBulkDelete}
          />
        </TabsContent>

        <TabsContent value="template">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <ChecklistGrid 
              checklists={filteredChecklists.filter(c => c.isTemplate)} 
              isLoading={isLoading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpenChecklist}
              onStatusChange={refetch}
              onBulkDelete={handleBulkDelete}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="active">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <ChecklistGrid 
              checklists={filteredChecklists.filter(c => c.status === "active" && !c.isTemplate)} 
              isLoading={isLoading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpenChecklist}
              onStatusChange={refetch}
              onBulkDelete={handleBulkDelete}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="inactive">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <ChecklistGrid 
              checklists={filteredChecklists.filter(c => c.status === "inactive" && !c.isTemplate)} 
              isLoading={isLoading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpenChecklist}
              onStatusChange={refetch}
              onBulkDelete={handleBulkDelete}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <DeleteChecklistDialog
        checklistId={deleteDialog.checklistId}
        checklistTitle={deleteDialog.checklistTitle}
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onDeleted={handleConfirmDelete}
      />
      
      <FloatingNavigation threshold={300} />
    </div>
  );
}
