
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChecklistGrid } from "./ChecklistGrid";
import { ChecklistList } from "./ChecklistList";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { ChecklistWithStats } from "@/types/newChecklist";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group";

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
  onBulkDelete: (ids: string[]) => Promise<void>; // Fixed return type to Promise<void>
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
  
  // Load view mode preference from localStorage on mount
  React.useEffect(() => {
    const savedViewMode = localStorage.getItem('checklist-view-mode');
    if (savedViewMode === 'list' || savedViewMode === 'grid') {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save tab preference to localStorage
  React.useEffect(() => {
    localStorage.setItem('checklist-active-tab', activeTab);
  }, [activeTab]);

  // Save view mode preference to localStorage
  React.useEffect(() => {
    localStorage.setItem('checklist-view-mode', viewMode);
  }, [viewMode]);

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
        
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
          className="border rounded-md ml-4"
        >
          <ToggleGroupItem value="grid" aria-label="Visualização em grid">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Visualização em lista">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
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
