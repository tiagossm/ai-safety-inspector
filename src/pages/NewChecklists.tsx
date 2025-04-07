
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, FileText, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNewChecklists } from "@/hooks/new-checklist/useNewChecklists";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { ChecklistList } from "@/components/new-checklist/ChecklistList";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";

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
    refetch
  } = useNewChecklists();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    checklistId: string;
    checklistTitle: string;
  }>({
    open: false,
    checklistId: "",
    checklistTitle: "",
  });

  // Count checklists by type
  const counts = {
    all: allChecklists.filter(c => !c.isSubChecklist).length,
    active: allChecklists.filter(c => !c.isSubChecklist && c.status === "active" && !c.isTemplate).length,
    inactive: allChecklists.filter(c => !c.isSubChecklist && c.status === "inactive" && !c.isTemplate).length,
    template: allChecklists.filter(c => !c.isSubChecklist && c.isTemplate).length
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
    });
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
        totalChecklists={checklists.length}
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
            <Clipboard className="h-4 w-4" />
            <span>Ativos</span>
            {counts.active > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{counts.active}</span>}
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <Clipboard className="h-4 w-4" />
            <span>Inativos</span>
            {counts.inactive > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{counts.inactive}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ChecklistList 
            checklists={checklists} 
            isLoading={isLoading} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpen={handleOpenChecklist}
            onStatusChange={refetch}
          />
        </TabsContent>

        <TabsContent value="template">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <ChecklistGrid 
              checklists={checklists.filter(c => c.isTemplate)} 
              isLoading={isLoading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpenChecklist}
              onStatusChange={refetch}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="active">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <ChecklistGrid 
              checklists={checklists.filter(c => c.status === "active" && !c.isTemplate)} 
              isLoading={isLoading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpenChecklist}
              onStatusChange={refetch}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="inactive">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <ChecklistGrid 
              checklists={checklists.filter(c => c.status === "inactive" && !c.isTemplate)} 
              isLoading={isLoading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpenChecklist}
              onStatusChange={refetch}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <DeleteChecklistDialog 
        checklistId={deleteDialog.checklistId}
        checklistTitle={deleteDialog.checklistTitle}
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
      />
      
      <FloatingNavigation threshold={300} />
    </div>
  );
}
