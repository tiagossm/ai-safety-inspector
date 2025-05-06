
import React from "react";
import { ClipboardList } from "lucide-react";

export function ActionPlanEmptyState() {
  return (
    <div className="text-center py-12">
      <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-1">Nenhum plano de ação encontrado</h3>
      <p className="text-muted-foreground">
        Ajuste os filtros ou crie novos planos de ação a partir das inspeções
      </p>
    </div>
  );
}
