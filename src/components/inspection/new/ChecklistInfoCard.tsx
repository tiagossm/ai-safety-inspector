
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface ChecklistInfoCardProps {
  loading: boolean;
  checklist: any;
  checklistId?: string;
}

export function ChecklistInfoCard({ loading, checklist, checklistId }: ChecklistInfoCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-40" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-32" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist Selecionado</CardTitle>
        <CardDescription>
          Detalhes do checklist a ser utilizado na inspeção
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <div className="font-medium mt-1">{checklist?.title}</div>
          </div>
          
          <div>
            <Label>Descrição</Label>
            <div className="text-sm text-muted-foreground mt-1">
              {checklist?.description || "Sem descrição"}
            </div>
          </div>
          
          <div>
            <Label>Número de Perguntas</Label>
            <div className="font-medium mt-1">
              {checklist?.checklist_itens?.length || 0}
            </div>
          </div>
          
          <div className="pt-2">
            <Label className="text-xs text-muted-foreground">ID do Checklist</Label>
            <div className="text-xs font-mono text-muted-foreground mt-1 break-all">
              {checklistId}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
