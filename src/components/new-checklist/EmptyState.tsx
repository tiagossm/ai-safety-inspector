
import React from "react";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyState() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-muted/20">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <FileX className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
        Você ainda não possui nenhum checklist. Crie um novo para começar a gerenciar suas inspeções.
      </p>
      <Button onClick={() => navigate("/new-checklists/create")}>
        Criar Checklist
      </Button>
    </div>
  );
}
