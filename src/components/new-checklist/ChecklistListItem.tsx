
import React from 'react';
import { formatDate } from '@/utils/format';
import { ChecklistWithStats } from '@/types/newChecklist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChecklistOriginBadge } from './ChecklistOriginBadge';
import {
  ArrowRight,
  Edit2,
  Trash2
} from 'lucide-react';

interface ChecklistListItemProps {
  checklist: ChecklistWithStats;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
}

export const ChecklistListItem = ({
  checklist,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onOpen
}: ChecklistListItemProps) => {
  // Calculate progress
  const progress = checklist.totalQuestions && checklist.completedQuestions
    ? Math.round((checklist.completedQuestions / checklist.totalQuestions) * 100)
    : 0;

  return (
    <div className={`grid grid-cols-10 items-center gap-4 p-4 rounded-md transition-all border border-slate-200 shadow-sm min-h-[72px]
      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
    >
      <div className="col-span-1 flex items-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(checklist.id, checked === true)}
          onClick={(e) => e.stopPropagation()}
          className={`${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
        />
      </div>
      <div className="col-span-4 flex flex-col">
        <div className="font-medium text-base flex items-center gap-2">
          {checklist.title}
          <ChecklistOriginBadge origin={checklist.origin} showLabel={false} className="ml-1" />
        </div>
        {checklist.companyName ? (
          <div className="text-sm text-muted-foreground truncate max-w-[400px]">
            {checklist.companyName}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic truncate max-w-[400px]">
            Sem empresa associada
          </div>
        )}
      </div>
      <div className="col-span-2">
        <Badge variant={checklist.isTemplate ? "outline" : "default"} className="px-2 py-0 text-xs">
          {checklist.isTemplate ? "Template" : checklist.status === 'active' ? "Ativo" : "Inativo"}
        </Badge>
        {checklist.category && (
          <Badge variant="outline" className="ml-1 px-2 py-0 text-xs">
            {checklist.category}
          </Badge>
        )}
      </div>
      <div className="col-span-1 text-xs text-gray-500">
        {formatDate(checklist.createdAt || "")}
      </div>
      <div className="col-span-1 pr-2">
        {checklist.totalQuestions > 0 && (
          <div className="space-y-1 w-full">
            <Progress value={progress} className="h-1" />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {progress}%
            </div>
          </div>
        )}
      </div>
      <div className="col-span-1 flex justify-end space-x-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(checklist.id)}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(checklist.id, checklist.title)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpen(checklist.id)}>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
