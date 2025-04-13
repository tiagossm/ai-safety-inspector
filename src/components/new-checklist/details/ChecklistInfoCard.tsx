
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";
import { ChecklistWithStats } from "@/types/newChecklist";

interface ChecklistInfoCardProps {
  checklist: ChecklistWithStats;
}

export function ChecklistInfoCard({ checklist }: ChecklistInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Checklist</CardTitle>
        <CardDescription>Detalhes e configurações do checklist.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Título</h4>
              <p className="text-muted-foreground">{checklist.title}</p>
            </div>
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Descrição</h4>
              <p className="text-muted-foreground">
                {checklist.description || "Nenhuma descrição fornecida."}
              </p>
            </div>
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Categoria</h4>
              <p className="text-muted-foreground">{checklist.category}</p>
            </div>
          </div>
          <div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Status</h4>
              <Badge variant={checklist.status === "active" ? "default" : "secondary"}>
                {checklist.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Criado em</h4>
              <p className="text-muted-foreground">
                {checklist.createdAt ? formatDate(checklist.createdAt) : "Data desconhecida"}
              </p>
            </div>
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Atualizado em</h4>
              <p className="text-muted-foreground">
                {checklist.updatedAt ? formatDate(checklist.updatedAt) : "Data desconhecida"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
