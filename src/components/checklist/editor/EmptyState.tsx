
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyState() {
  const navigate = useNavigate();
  
  return (
    <div className="py-20 text-center">
      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Nenhum dado encontrado</h2>
      <p className="text-muted-foreground mb-6">Não foi possível carregar os dados do checklist</p>
      <Button onClick={() => navigate("/checklists")} className="mx-auto">
        Voltar para Checklists
      </Button>
    </div>
  );
}
