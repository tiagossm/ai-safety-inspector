
import { FileText, Archive, CheckSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { ChecklistWithStats } from "@/types/newChecklist";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface ChecklistTabsProps {
  checklistCounts: {
    template: number;
    active: number;
    inactive: number;
  };
  allChecklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
  onBulkDelete: (ids: string[]) => void;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function ChecklistTabs({
  checklistCounts,
  allChecklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete,
  onTabChange,
  activeTab
}: ChecklistTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  useEffect(() => {
    searchParams.set('tab', activeTab);
    setSearchParams(searchParams);
    localStorage.setItem('checklist-active-tab', activeTab);
  }, [activeTab, setSearchParams, searchParams]);

  const filteredChecklists = allChecklists.filter(c => !c.isSubChecklist);
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="template" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Templates</span>
          {checklistCounts.template > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{checklistCounts.template}</span>}
        </TabsTrigger>
        <TabsTrigger value="active" className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          <span>Ativos</span>
          {checklistCounts.active > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{checklistCounts.active}</span>}
        </TabsTrigger>
        <TabsTrigger value="inactive" className="flex items-center gap-2">
          <Archive className="h-4 w-4" />
          <span>Inativos</span>
          {checklistCounts.inactive > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">{checklistCounts.inactive}</span>}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="template">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <ChecklistGrid 
            checklists={filteredChecklists.filter(c => c.isTemplate)} 
            isLoading={isLoading} 
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
            onStatusChange={onStatusChange}
            onBulkDelete={onBulkDelete}
          />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="active">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <ChecklistGrid 
            checklists={filteredChecklists.filter(c => c.status === "active" && !c.isTemplate)} 
            isLoading={isLoading} 
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
            onStatusChange={onStatusChange}
            onBulkDelete={onBulkDelete}
          />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="inactive">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <ChecklistGrid 
            checklists={filteredChecklists.filter(c => c.status === "inactive" && !c.isTemplate)} 
            isLoading={isLoading} 
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
            onStatusChange={onStatusChange}
            onBulkDelete={onBulkDelete}
          />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
