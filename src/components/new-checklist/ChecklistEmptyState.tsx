
import React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardX } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChecklistEmptyStateProps {
  message: string;
}

export function ChecklistEmptyState({ message }: ChecklistEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <ClipboardX className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {message}
      </p>
      <Button onClick={() => navigate("/new-checklists/create")}>
        Criar Novo Checklist
      </Button>
    </div>
  );
}
