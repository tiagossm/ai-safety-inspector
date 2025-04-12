
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

interface QuestionsEmptyStateProps {
  loading: boolean;
  currentGroupId: string | null;
  currentGroup: any;
  questionsCount: number;
}

export function QuestionsEmptyState({
  loading,
  currentGroupId,
  currentGroup,
  questionsCount
}: QuestionsEmptyStateProps) {
  let message = "";
  let icon = <AlertCircle className="h-10 w-10 text-muted-foreground opacity-40" />;
  
  if (loading) {
    message = "Carregando perguntas...";
    icon = <Loader2 className="h-10 w-10 text-primary opacity-40 animate-spin" />;
  } else if (!currentGroupId) {
    message = "Nenhum grupo selecionado";
  } else if (!currentGroup) {
    message = "Grupo não encontrado";
  } else if (questionsCount === 0) {
    message = "Nenhuma pergunta disponível neste checklist";
  } else {
    message = "Nenhuma pergunta disponível neste grupo";
  }
  
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          {icon}
          <p className="text-muted-foreground">{message}</p>
          {questionsCount > 0 && !currentGroupId && (
            <p className="text-sm text-muted-foreground mt-2">
              Selecione um grupo na barra lateral para ver as perguntas.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
