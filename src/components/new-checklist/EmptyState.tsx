
import React from "react";
import { FileCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyState() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg px-4">
      <div className="bg-primary/10 p-3 rounded-full mb-4">
        <FileCheck className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Nenhum checklist encontrado</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Você ainda não possui nenhum checklist. Crie o primeiro para começar a realizar inspeções e verificações.
      </p>
      <Button 
        onClick={() => navigate("/new-checklists/create")}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Criar checklist
      </Button>
    </div>
  );
}
