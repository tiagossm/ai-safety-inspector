
import React from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistCard } from "./ChecklistCard";
import { ChecklistEmptyState } from "./ChecklistEmptyState";
import { ChecklistLoadingSkeleton } from "./ChecklistLoadingSkeleton";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onChecklistStatusChange: (id: string, newStatus: "active" | "inactive") => Promise<boolean>;
}

export function ChecklistGrid({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onChecklistStatusChange
}: ChecklistGridProps) {
  if (isLoading) {
    return <ChecklistLoadingSkeleton />;
  }

  if (checklists.length === 0) {
    return <ChecklistEmptyState message="Não foram encontrados checklists com os filtros atuais." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {checklists.filter(c => !c.isSubChecklist).map((checklist) => (
        <ChecklistCard
          key={checklist.id}
          checklist={checklist}
          onDelete={onDelete}
          onEdit={onEdit}
          onOpen={onOpen}
          onStatusChange={onChecklistStatusChange}
        />
      ))}
    </div>
  );
}
