
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Archive, CheckSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNewChecklists } from "@/hooks/new-checklist/useNewChecklists";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { ChecklistList } from "@/components/new-checklist/ChecklistList";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { toast } from "sonner";

export default function NewChecklists() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
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
    refetch,
    deleteChecklist
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
  
  // Update URL and localStorage when tab changes
  useEffect(() => {
    searchParams.set('tab', activeTab);
    setSearchParams(searchParams);
    localStorage.setItem('checklist-active-tab', activeTab);
    
    // Update filter type based on active tab
    if (activeTab === 'template') {
      setFilterType('template');
    } else if (activeTab === 'active') {
      setFilterType('active');
    } else if (activeTab === 'inactive') {
      setFilterType('inactive');
    }
  }, [activeTab, setSearchParams, searchParams, setFilterType]);
  
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
    template: filteredChecklists.filter(c => c.isTemplate).length,
    active: filteredChecklists.filter(c => c.status === "active" && !c.isTemplate).length,
    inactive: filteredChecklists.filter(c => c.status === "inactive" && !c.isTemplate).length
  };

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
        selectedOrigin={selectedOrigin}
        setSelectedOrigin={setSelectedOrigin}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        companies={companies}
        categories={categories}
        isLoadingCompanies={isLoadingCompanies}
        totalChecklists={filteredChecklists.length}
        onCreateNew={handleCreateNew}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
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
