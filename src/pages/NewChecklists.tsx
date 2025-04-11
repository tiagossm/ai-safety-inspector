import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNewChecklists } from "@/hooks/new-checklist/useNewChecklists";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { toast } from "sonner";
import { ChecklistTabs } from "@/components/new-checklist/ChecklistTabs";
import { ChecklistWithStats } from "@/types/newChecklist";

export default function NewChecklists() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
    selectedOrigin,
    setSelectedOrigin,
    sortOrder,
    setSortOrder,
    companies,
    categories,
    isLoadingCompanies,
    deleteChecklist,
    updateStatus,
    updateBulkStatus,
    refetch
  } = useNewChecklists();
  
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['template', 'active', 'inactive'].includes(tabFromUrl)) {
      return tabFromUrl;
    }
    
    const savedTab = localStorage.getItem('checklist-active-tab');
    return savedTab || 'template';
  });
  
  useEffect(() => {
    if (activeTab === 'template') {
      setFilterType('template');
    } else if (activeTab === 'active') {
      setFilterType('active');
    } else if (activeTab === 'inactive') {
      setFilterType('inactive');
    }
  }, [activeTab, setFilterType]);
  
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

  const checklistCounts = React.useMemo(() => {
    const filtered = allChecklists.filter(c => !c.isSubChecklist);
    
    return {
      template: filtered.filter(c => c.isTemplate).length,
      active: filtered.filter(c => c.status === "active" && !c.isTemplate).length,
      inactive: filtered.filter(c => c.status === "inactive" && !c.isTemplate).length
    };
  }, [allChecklists]);

  const handleOpenChecklist = (id: string) => {
    navigate(`/new-checklists/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/new-checklists/edit/${id}`);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteDialog({
      open: true,
      checklistId: id,
      checklistTitle: title,
      isMultiple: false,
      selectedIds: []
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    setDeleteDialog({
      open: true,
      checklistId: "",
      checklistTitle: `${ids.length} checklists selecionados`,
      isMultiple: true,
      selectedIds: ids
    });
  };

  const handleBatchUpdate = async (ids: string[], newStatus: "active" | "inactive"): Promise<void> => {
    try {
      await updateBulkStatus.mutateAsync({ checklistIds: ids, newStatus });
    } catch (error) {
      console.error("Error updating status for multiple checklists:", error);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteDialog.isMultiple) {
        for (const id of deleteDialog.selectedIds) {
          await deleteChecklist.mutateAsync(id);
        }
        toast.success(`${deleteDialog.selectedIds.length} checklists excluídos com sucesso`);
      } else {
        await deleteChecklist.mutateAsync(deleteDialog.checklistId);
        toast.success("Checklist excluído com sucesso");
      }
      
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      await updateStatus.mutateAsync({ checklistId: id, newStatus });
      return true;
    } catch (error) {
      console.error("Error updating checklist status:", error);
      throw error;
    }
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
        selectedOrigin={selectedOrigin}
        setSelectedOrigin={setSelectedOrigin}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        companies={companies}
        categories={categories}
        isLoadingCompanies={isLoadingCompanies}
        totalChecklists={allChecklists.filter(c => !c.isSubChecklist).length}
        onCreateNew={handleCreateNew}
      />

      <ChecklistTabs
        checklistCounts={checklistCounts}
        allChecklists={checklists}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpen={handleOpenChecklist}
        onStatusChange={refetch}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBatchUpdate}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        onChecklistStatusChange={handleStatusChange}
      />

      <DeleteChecklistDialog
        checklistId={deleteDialog.checklistId}
        checklistTitle={deleteDialog.checklistTitle}
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onDeleted={handleConfirmDelete}
        isDeleting={isDeleting}
      />
      
      <FloatingNavigation threshold={300} />
    </div>
  );
}
