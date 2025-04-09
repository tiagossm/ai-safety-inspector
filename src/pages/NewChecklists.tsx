
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNewChecklists } from "@/hooks/new-checklist/useNewChecklists";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { toast } from "sonner";
import { ChecklistTabs } from "@/components/new-checklist/ChecklistTabs";
import { ChecklistWithStats } from "@/types/newChecklist";
import { checklistService } from "@/services/checklist/checklistService";

export default function NewChecklists() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Use the refactored hook to get all checklist functionality
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
  
  // Get tab from URL params or localStorage, default to "template"
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['template', 'active', 'inactive'].includes(tabFromUrl)) {
      return tabFromUrl;
    }
    
    const savedTab = localStorage.getItem('checklist-active-tab');
    return savedTab || 'template';
  });
  
  // Update filter type based on active tab
  useEffect(() => {
    if (activeTab === 'template') {
      setFilterType('template');
    } else if (activeTab === 'active') {
      setFilterType('active');
    } else if (activeTab === 'inactive') {
      setFilterType('inactive');
    }
  }, [activeTab, setFilterType]);
  
  // Delete dialog state
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
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Count checklists by type - excluding subchecklist
  const checklistCounts = React.useMemo(() => {
    const filtered = allChecklists.filter(c => !c.isSubChecklist);
    
    return {
      template: filtered.filter(c => c.isTemplate).length,
      active: filtered.filter(c => c.status === "active" && !c.isTemplate).length,
      inactive: filtered.filter(c => c.status === "inactive" && !c.isTemplate).length
    };
  }, [allChecklists]);

  // Navigation handlers
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

  // Handle status update for multiple checklists
  const handleBulkStatusChange = async (ids: string[], newStatus: "active" | "inactive") => {
    try {
      setIsActionLoading(true);
      
      const result = await checklistService.updateStatus(ids, newStatus);
      
      if (result.success) {
        toast.success(`${result.count} checklists updated successfully`);
        await refetch();
        setSelectedIds([]);
        return true;
      } else {
        toast.error("Failed to update checklists");
        return false;
      }
    } catch (error) {
      console.error("Error updating checklists:", error);
      toast.error("An error occurred while updating checklists");
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteComplete = async () => {
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
      
      // Refetch data after deletion
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

  // Handle status change for a single checklist
  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      await updateStatus.mutateAsync({ checklistId: id, newStatus });
      return true;
    } catch (error) {
      console.error("Error updating checklist status:", error);
      throw error;
    }
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
        onBulkStatusChange={handleBulkStatusChange}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        onChecklistStatusChange={handleStatusChange}
      />

      <DeleteChecklistDialog 
        checklistId={deleteDialog.checklistId || ""}
        checklistTitle={deleteDialog.checklistTitle || ""}
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onDeleted={handleDeleteComplete}
        isDeleting={isDeleting}
      />
      
      <FloatingNavigation threshold={300} />
    </div>
  );
}
