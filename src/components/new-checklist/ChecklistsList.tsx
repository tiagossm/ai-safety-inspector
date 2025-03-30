
import React from "react";
import { ChecklistCard } from "./ChecklistCard";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Checklist } from "@/types/newChecklist";

interface ChecklistsListProps {
  checklists: Checklist[];
  loading: boolean;
  error: any;
  onSelectChecklist: (checklist: Checklist) => void;
  onEditChecklist: (id: string) => void;
  onDeleteChecklist: (id: string) => void;
  onDuplicateChecklist: (id: string) => void;
}

export function ChecklistsList({
  checklists,
  loading,
  error,
  onSelectChecklist,
  onEditChecklist,
  onDeleteChecklist,
  onDuplicateChecklist
}: ChecklistsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-2">
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center border rounded-lg">
        <p className="text-red-500">Erro ao carregar checklists: {error.message}</p>
      </div>
    );
  }
  
  // Filter out sub-checklists
  const mainChecklists = checklists.filter(checklist => !checklist.is_sub_checklist);
  
  if (mainChecklists.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mainChecklists.map((checklist) => (
        <ChecklistCard
          key={checklist.id}
          checklist={checklist}
          onOpen={() => onSelectChecklist(checklist)}
          onEdit={() => onEditChecklist(checklist.id)}
          onDelete={() => onDeleteChecklist(checklist.id)}
          onDuplicate={() => onDuplicateChecklist(checklist.id)}
        />
      ))}
    </div>
  );
}
