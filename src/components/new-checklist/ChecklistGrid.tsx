
import React from "react";
import { Link } from "react-router-dom";
import { Grid } from "@/components/ui/grid";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistCard } from "./ChecklistCard";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onOpen?: (id: string) => void;
}

export function ChecklistGrid({ 
  checklists, 
  isLoading,
  onEdit,
  onDelete,
  onDuplicate,
  onOpen
}: ChecklistGridProps) {
  // Filtrar sub-checklists para não exibi-los na grade
  const filteredChecklists = checklists.filter(
    checklist => {
      // Verificar ambas as propriedades para garantir compatibilidade
      const isSubChecklist = checklist.isSubChecklist || checklist.is_sub_checklist;
      return !isSubChecklist;
    }
  );
  
  if (isLoading) {
    return (
      <Grid className="gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </Grid>
    );
  }

  return (
    <Grid className="gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Link to="/new-checklists/create" className="block">
        <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center hover:bg-gray-50">
          <PlusCircle className="h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Criar Nova Lista</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie uma nova lista de verificação do zero
          </p>
        </div>
      </Link>

      {filteredChecklists.map((checklist) => (
        <ChecklistCard 
          key={checklist.id} 
          checklist={checklist} 
          onEdit={onEdit || (() => {})}
          onDelete={onDelete || (() => {})}
          onDuplicate={onDuplicate}
          onOpen={onOpen}
        />
      ))}
      
      {filteredChecklists.length === 0 && !isLoading && (
        <div className="col-span-full p-8 text-center">
          <p className="mb-4 text-muted-foreground">Nenhuma lista encontrada</p>
          <Button asChild variant="default">
            <Link to="/new-checklists/create">Criar Primeira Lista</Link>
          </Button>
        </div>
      )}
    </Grid>
  );
}
