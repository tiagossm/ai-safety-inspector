
import React from "react";
import { ChecklistCard } from "./ChecklistCard";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistEmptyState } from "./ChecklistEmptyState";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, newStatus: "active" | "inactive") => Promise<boolean>;
  onSelect: (id: string, selected: boolean) => void;
  selectedIds: string[];
  showCheckboxes?: boolean;
}

export function ChecklistGrid({
  checklists,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onSelect,
  selectedIds,
  showCheckboxes = false
}: ChecklistGridProps) {
  if (checklists.length === 0) {
    return (
      <ChecklistEmptyState message="Nenhum checklist encontrado com os filtros selecionados." />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {checklists.map((checklist) => (
        <ChecklistCard
          key={checklist.id}
          checklist={checklist}
          onDelete={onDelete}
          onEdit={onEdit}
          onOpen={onOpen}
          onStatusChange={onStatusChange}
          isSelected={selectedIds.includes(checklist.id)}
          onSelect={onSelect}
          showCheckbox={showCheckboxes}
        />
      ))}
    </div>
  );
}
