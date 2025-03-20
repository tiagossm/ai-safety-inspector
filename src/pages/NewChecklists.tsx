
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, FileText, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChecklistFetch } from "@/hooks/new-checklist/useChecklistFetch";
import { useChecklistFilter } from "@/hooks/new-checklist/useChecklistFilter";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { ChecklistList } from "@/components/new-checklist/ChecklistList";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";

export default function NewChecklists() {
  const navigate = useNavigate();
  const { data: checklists = [], isLoading } = useChecklistFetch();
  
  const { 
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    companies,
    isLoadingCompanies,
    filteredChecklists
  } = useChecklistFilter(checklists);
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    checklistId: string;
    checklistTitle: string;
  }>({
    open: false,
    checklistId: "",
    checklistTitle: "",
  });

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
        companies={companies}
        isLoadingCompanies={isLoadingCompanies}
        totalChecklists={filteredChecklists.length}
        onCreateNew={handleCreateNew}
      />

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Grade</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Clipboard className="h-4 w-4" />
            <span>Lista</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <ChecklistGrid 
              checklists={filteredChecklists} 
              isLoading={isLoading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpenChecklist}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="list">
          <ChecklistList 
            checklists={filteredChecklists} 
            isLoading={isLoading} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpen={handleOpenChecklist}
          />
        </TabsContent>
      </Tabs>

      <DeleteChecklistDialog 
        checklistId={deleteDialog.checklistId}
        checklistTitle={deleteDialog.checklistTitle}
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
      />
    </div>
  );
}
