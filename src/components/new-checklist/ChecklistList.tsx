import React from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistListItem } from "./ChecklistListItem";
import { ChecklistLoadingSkeleton } from "./ChecklistLoadingSkeleton";
import { ChecklistEmptyState } from "./ChecklistEmptyState";

interface ChecklistListProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: () => void;
  onBulkStatusChange: (ids: string[], newStatus: 'active' | 'inactive') => Promise<void>;
  onBulkDelete?: (ids: string[]) => void;
}

export function ChecklistList({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkStatusChange,
  onBulkDelete
}: ChecklistListProps) {
  const [selectedChecklists, setSelectedChecklists] = React.useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChecklists(checklists.map(c => c.id));
    } else {
      setSelectedChecklists([]);
    }
  };

  const handleSelectChecklist = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedChecklists([...selectedChecklists, id]);
    } else {
      setSelectedChecklists(selectedChecklists.filter(checklistId => checklistId !== id));
    }
  };

  if (isLoading) return <ChecklistLoadingSkeleton />;
  if (checklists.length === 0) return <ChecklistEmptyState message="Nenhum checklist encontrado." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Checkbox
          checked={selectedChecklists.length === checklists.length}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
        />
        <span className="text-sm text-muted-foreground">
          {selectedChecklists.length} selecionado(s)
        </span>
      </div>

      <div className="space-y-2">
        {checklists.map((checklist) => (
          <ChecklistListItem
            key={checklist.id}
            checklist={checklist}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
            isSelected={selectedChecklists.includes(checklist.id)}
            onSelect={(checked) => handleSelectChecklist(checklist.id, checked)}
          />
        ))}
      </div>
    </div>
  );
}
