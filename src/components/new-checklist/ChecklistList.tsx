
import React from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistRow } from "./ChecklistRow";
import { ChecklistLoadingSkeleton } from "./ChecklistLoadingSkeleton";
import { ChecklistEmptyState } from "./ChecklistEmptyState";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedChecklists.length === checklists.length && checklists.length > 0}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
          />
          <span className="text-sm text-muted-foreground">
            {selectedChecklists.length} selecionado(s)
          </span>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Checklist</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Criado por</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklists.map((checklist) => (
              <ChecklistRow
                key={checklist.id}
                checklist={checklist}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpen={onOpen}
                onStatusChange={onStatusChange}
                isSelected={selectedChecklists.includes(checklist.id)}
                onSelect={(checked) => handleSelectChecklist(checklist.id, checked)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
