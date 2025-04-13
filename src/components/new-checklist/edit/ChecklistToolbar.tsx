
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";

export function ChecklistToolbar() {
  const { viewMode, setViewMode } = useChecklistEditor();
  
  return (
    <Tabs 
      value={viewMode} 
      onValueChange={(value) => setViewMode(value as "flat" | "grouped")}
    >
      <TabsList>
        <TabsTrigger value="flat">Lista</TabsTrigger>
        <TabsTrigger value="grouped">Agrupado</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
