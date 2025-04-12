
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistListItem } from "@/components/new-checklist/ChecklistListItem";
import { ChecklistEmptyState } from "@/components/new-checklist/ChecklistEmptyState";
import { Separator } from "@/components/ui/separator";

interface ChecklistsTableProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  selectedChecklists: string[];
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectChecklist: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
}

export function ChecklistsTable({
  checklists,
  isLoading,
  selectedChecklists,
  isAllSelected,
  onSelectAll,
  onSelectChecklist,
  onEdit,
  onDelete,
  onOpen,
}: ChecklistsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Checklists</CardTitle>
          <CardDescription>
            Carregando checklists...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-10 items-center gap-4 p-4 rounded-md transition-all border border-slate-200 shadow-sm min-h-[72px]"
              >
                <div className="col-span-1 flex items-center">
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <div className="col-span-4">
                  <Skeleton className="h-4 w-[250px]" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-4 w-[50px]" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-4 w-[50px]" />
                </div>
                <div className="col-span-2 flex justify-end space-x-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Checklists</CardTitle>
        <CardDescription>
          Gerencie seus checklists e acompanhe seu progresso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {checklists.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              Nenhum checklist encontrado.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:flex items-center p-2 rounded-md bg-muted">
              <div className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                />
              </div>
              <div className="w-1/4">Título</div>
              <div className="w-1/4">Empresa</div>
              <div className="w-1/6">Status</div>
              <div className="w-1/6">Criado em</div>
              <div className="w-1/6 text-right">Ações</div>
            </div>
            <div className="overflow-x-auto">
              {checklists.map((checklist) => (
                <ChecklistListItem
                  key={checklist.id}
                  checklist={checklist}
                  onOpen={onOpen}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isSelected={selectedChecklists.includes(checklist.id)}
                  onSelect={onSelectChecklist}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
