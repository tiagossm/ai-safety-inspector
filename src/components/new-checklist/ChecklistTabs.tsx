
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChecklistGrid } from "./ChecklistGrid";
import { ChecklistList } from "./ChecklistList";
import { Button } from "@/components/ui/button";
import { List, Grid } from "lucide-react";
import { ChecklistWithStats } from "@/types/newChecklist";

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
  onBulkStatusChange: (ids: string[], newStatus: 'active' | 'inactive') => Promise<void>;
  onTabChange: (tab: string) => void;
  activeTab: string;
  onChecklistStatusChange: (id: string, newStatus: 'active' | 'inactive') => Promise<boolean>;
}

/**
 * Component that handles all tab views for checklists
 */
export function ChecklistTabs({
  checklistCounts,
  allChecklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete,
  onBulkStatusChange,
  onTabChange,
  activeTab,
  onChecklistStatusChange
}: ChecklistTabsProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Save tab preference to localStorage
  React.useEffect(() => {
    localStorage.setItem('checklist-active-tab', activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="template">
              Templates ({checklistCounts.template})
            </TabsTrigger>
            <TabsTrigger value="active">
              Ativos ({checklistCounts.active})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inativos ({checklistCounts.inactive})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center border rounded-md ml-4">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <ChecklistGrid
          checklists={allChecklists}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
          onStatusChange={onStatusChange}
          onBulkDelete={onBulkDelete}
        />
      ) : (
        <ChecklistList
          checklists={allChecklists}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
          onStatusChange={onStatusChange}
          onBulkStatusChange={onBulkStatusChange}
          onBulkDelete={onBulkDelete}
        />
      )}
    </div>
  );
}
