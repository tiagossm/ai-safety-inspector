
import React from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, Plus } from "lucide-react";

interface SubChecklistButtonProps {
  parentQuestionId: string;
  hasSubChecklist: boolean;
  subChecklistId?: string;
  onSubChecklistCreated: (subChecklistId: string) => void;
}

export function SubChecklistButton({
  parentQuestionId,
  hasSubChecklist,
  subChecklistId,
  onSubChecklistCreated
}: SubChecklistButtonProps) {
  const handleCreateSubChecklist = () => {
    // Por enquanto, simula a criação de um sub-checklist
    const newSubChecklistId = `sub-${Date.now()}`;
    onSubChecklistCreated(newSubChecklistId);
  };

  if (hasSubChecklist && subChecklistId) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <FileCheck className="h-4 w-4 mr-2" />
        Editar Sub-checklist
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCreateSubChecklist}
      className="text-gray-600 hover:text-blue-600"
    >
      <Plus className="h-4 w-4 mr-2" />
      Adicionar Sub-checklist
    </Button>
  );
}
