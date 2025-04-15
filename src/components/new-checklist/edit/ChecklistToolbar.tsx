
import React from 'react';
import { Grid, Rows } from 'lucide-react';
import { useChecklistEditor } from '@/contexts/ChecklistEditorContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ChecklistToolbar() {
  const { 
    viewMode, 
    setViewMode
  } = useChecklistEditor();

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "flat" | "grouped")}>
          <TabsList>
            <TabsTrigger value="flat">
              <Rows className="h-4 w-4 mr-1" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="grouped">
              <Grid className="h-4 w-4 mr-1" />
              Agrupado
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Removed any additional buttons or question count displays */}
    </div>
  );
}
