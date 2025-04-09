
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistGrid } from "./ChecklistGrid";
import { ChecklistList } from "./ChecklistList";
import { Button } from "@/components/ui/button";
import { Grid2x2, List } from "lucide-react";

interface ChecklistTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  checklistCounts: {
    active: number;
    template: number;
    inactive: number;
  };
  allChecklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
  onBulkDelete?: (ids: string[]) => Promise<boolean>;
  onBulkStatusChange: (ids: string[], newStatus: "active" | "inactive") => Promise<void>;
  onChecklistStatusChange: (id: string, newStatus: "active" | "inactive") => Promise<boolean>;
}

export function ChecklistTabs({
  activeTab,
  onTabChange,
  checklistCounts,
  allChecklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete,
  onBulkStatusChange,
  onChecklistStatusChange
}: ChecklistTabsProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  React.useEffect(() => {
    if (activeTab) {
      localStorage.setItem('checklist-active-tab', activeTab);
    }
  }, [activeTab]);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" className="min-w-[100px]">
              Todos
              <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                {checklistCounts.active + checklistCounts.template + checklistCounts.inactive}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active" className="min-w-[100px]">
              Ativos
              <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                {checklistCounts.active}
              </span>
            </TabsTrigger>
            <TabsTrigger value="inactive" className="min-w-[100px]">
              Inativos
              <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                {checklistCounts.inactive}
              </span>
            </TabsTrigger>
            <TabsTrigger value="template" className="min-w-[100px]">
              Templates
              <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                {checklistCounts.template}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center rounded-md border bg-muted/50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none ${viewMode === "grid" ? "" : "bg-transparent text-muted-foreground"}`}
                onClick={() => handleViewModeChange("grid")}
              >
                <Grid2x2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none ${viewMode === "list" ? "" : "bg-transparent text-muted-foreground"}`}
                onClick={() => handleViewModeChange("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {["all", "active", "inactive", "template"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {viewMode === "grid" ? (
              <ChecklistGrid
                checklists={allChecklists}
                isLoading={isLoading}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpen={onOpen}
                onChecklistStatusChange={onChecklistStatusChange}
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
