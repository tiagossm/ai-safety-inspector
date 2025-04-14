
import React from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { Button } from "@/components/ui/button";
import { ListFilter, Layers } from "lucide-react";

export function ChecklistToolbar() {
  const { viewMode, setViewMode } = useChecklistEditor();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={viewMode === "flat" ? "secondary" : "outline"}
        size="sm"
        onClick={() => setViewMode("flat")}
        className="flex items-center gap-1"
      >
        <ListFilter className="h-4 w-4" />
        <span>Lista</span>
      </Button>
      <Button
        variant={viewMode === "grouped" ? "secondary" : "outline"}
        size="sm"
        onClick={() => setViewMode("grouped")}
        className="flex items-center gap-1"
      >
        <Layers className="h-4 w-4" />
        <span>Agrupado</span>
      </Button>
    </div>
  );
}
