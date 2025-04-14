
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, Rows, Sparkles } from 'lucide-react';
import { useChecklistEditor } from '@/contexts/ChecklistEditorContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ChecklistToolbar() {
  const { 
    viewMode, 
    setViewMode,
    questions,
    handleAddQuestion
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
        {questions.length > 0 && (
          <Badge variant="outline" className="ml-2">
            {questions.length} {questions.length === 1 ? 'Pergunta' : 'Perguntas'}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          type="button" 
          variant="default"
          size="sm"
          onClick={() => handleAddQuestion("default")}
          className="whitespace-nowrap"
          aria-label="Adicionar nova pergunta"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Adicionar Pergunta
        </Button>
      </div>
    </div>
  );
}
