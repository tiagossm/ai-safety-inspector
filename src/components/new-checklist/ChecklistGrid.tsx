
import React from "react";
import { ChecklistCard } from "./ChecklistCard";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Skeleton } from "@/components/ui/skeleton";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
}

export function ChecklistGrid({ 
  checklists, 
  isLoading, 
  onEdit, 
  onDelete,
  onOpen,
  onStatusChange
}: ChecklistGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="border rounded-md p-4 h-[360px]">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="mt-auto pt-4">
              <Skeleton className="h-10 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={1}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum checklist encontrado</h3>
        <p className="mt-2 text-sm text-gray-500">
          Não foram encontrados checklists com os filtros atuais.
        </p>
      </div>
    );
  }

  // Filter out sub-checklists
  const filteredChecklists = checklists.filter(checklist => !checklist.isSubChecklist);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredChecklists.map((checklist) => (
        <ChecklistCard
          key={checklist.id}
          checklist={checklist}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
