
import React from "react";
import { ChecklistCard } from "./ChecklistCard";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Loader2 } from "lucide-react";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold mb-2">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground max-w-md">
          Não foi encontrado nenhum checklist com os filtros atuais. Tente ajustar os filtros ou criar um novo checklist.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {checklists.map((checklist) => (
        <ChecklistCard
          key={checklist.id}
          checklist={checklist}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
