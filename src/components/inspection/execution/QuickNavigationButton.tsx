
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings2, Plus } from "lucide-react";

export function QuickNavigationButton() {
  const navigate = useNavigate();

  const handleNavigateToChecklistCreate = () => {
    navigate("/new-checklists/create");
  };

  const handleNavigateToChecklistEdit = () => {
    // Navegar para edição de um checklist existente (usando um ID de exemplo)
    navigate("/new-checklists/edit/98ceb3ce-11af-4cfa-8dce-5ae907415de0");
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      <Button
        onClick={handleNavigateToChecklistCreate}
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
      >
        <Plus className="h-4 w-4 mr-2" />
        Criar Checklist
      </Button>
      <Button
        onClick={handleNavigateToChecklistEdit}
        size="sm"
        variant="outline"
        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg"
      >
        <Settings2 className="h-4 w-4 mr-2" />
        Editar Checklist
      </Button>
    </div>
  );
}
