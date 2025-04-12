import React from "react";
import { formatDate } from "@/utils/format";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { ArrowRight, Edit2, Trash2 } from "lucide-react";

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
  const progress = checklist.totalQuestions && checklist.completedQuestions
    ? Math.round((checklist.completedQuestions / checklist.totalQuestions) * 100)
    : 0;

  const originValue = checklist.origin as "manual" | "ia" | "csv" | undefined;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(checklist.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(checklist.id, checklist.title);
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(checklist.id);
  };

  return (
    <div
      className={`group border rounded-lg shadow-sm transition-all hover:bg-accent p-4 cursor-pointer flex flex-col md:grid md:grid-cols-10 gap-4 items-center min-h-[88px] ${isSelected ? "bg-blue-50" : ""}`}
      onClick={() => onOpen(checklist.id)}
    >
      <div className="md:col-span-1 flex items-center self-start md:self-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(checklist.id, checked === true)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="md:col-span-4 flex flex-col w-full">
        <div className="font-medium text-base flex items-center gap-2">
          {checklist.title}
          <ChecklistOriginBadge origin={originValue} showLabel={false} className="ml-1" />
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {checklist.companyName || <i>Sem empresa associada</i>}
        </div>
      </div>

      <div className="md:col-span-2 w-full flex flex-wrap gap-1 text-xs">
        <Badge variant={checklist.isTemplate ? "outline" : "default"}>
          {checklist.isTemplate ? "Template" : checklist.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
        {checklist.category && <Badge variant="outline">{checklist.category}</Badge>}
      </div>

      <div className="md:col-span-1 w-full text-xs text-muted-foreground">
        {formatDate(checklist.createdAt || "")}
      </div>

      <div className="md:col-span-1 w-full">
        {checklist.totalQuestions > 0 && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1" />
            <div className="text-right text-xs text-muted-foreground">{progress}%</div>
          </div>
        )}
      </div>

      <div className="md:col-span-1 flex justify-end gap-1 self-start md:self-center w-full">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEditClick}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDeleteClick}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleOpenClick}>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
