
import { useState } from "react";
import { Clipboard, FileText, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteChecklistDialog } from "@/components/checklists/DeleteChecklistDialog";
import { useChecklists } from "@/hooks/useChecklists";
import { useNavigate } from "react-router-dom";
import { ChecklistsHeader } from "@/components/checklists/ChecklistsHeader";
import { ChecklistsFilter } from "@/components/checklists/ChecklistsFilter";
import { ChecklistsGrid } from "@/components/checklists/ChecklistsGrid";
import { ChecklistsList } from "@/components/checklists/ChecklistsList";
import { ChecklistsDashboard } from "@/components/checklists/ChecklistsDashboard";

export default function Checklists() {
  const navigate = useNavigate();
  const { 
    checklists, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId
  } = useChecklists();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    checklistId: string;
    checklistTitle: string;
  }>({
    open: false,
    checklistId: "",
    checklistTitle: "",
  });

  // Wrapper function to safely handle filter type changes
  const handleFilterTypeChange = (value: string) => {
    if (value === "all" || value === "active" || value === "template") {
      setFilterType(value);
    } else {
      console.warn(`Invalid filter type: ${value}`);
      setFilterType("all");
    }
  };

  const handleOpenChecklist = (id: string) => {
    console.log(`Opening checklist: ${id}`);
    navigate(`/checklists/${id}`);
  };

  const handleDelete = (id: string, title: string) => {
    console.log(`Preparing to delete checklist: ${id} (${title})`);
    setDeleteDialog({
      open: true,
      checklistId: id,
      checklistTitle: title,
    });
  };

  return (
    <div className="space-y-6">
      <ChecklistsHeader />

      <ChecklistsFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={handleFilterTypeChange}
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
        totalChecklists={checklists.length}
      />

      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Grade</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
          </TabsList>
          
          <p className="text-sm text-muted-foreground">
            {checklists.length} {checklists.length === 1 ? 'checklist' : 'checklists'} encontrados
          </p>
        </div>

        <TabsContent value="grid">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <ChecklistsGrid 
              checklists={checklists} 
              isLoading={isLoading} 
              onOpenChecklist={handleOpenChecklist} 
              onDelete={handleDelete} 
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="list">
          <ChecklistsList 
            checklists={checklists} 
            isLoading={isLoading} 
            onOpenChecklist={handleOpenChecklist} 
            onDelete={handleDelete} 
          />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <ChecklistsDashboard />
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
