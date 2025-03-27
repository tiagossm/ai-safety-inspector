
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

interface QuestionsEmptyStateProps {
  loading?: boolean;
  currentGroupId?: string | null;
  currentGroup?: any;
  questionsCount?: number;
}

export function QuestionsEmptyState({
  loading,
  currentGroupId,
  currentGroup,
  questionsCount = 0
}: QuestionsEmptyStateProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando perguntas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentGroupId || !currentGroup) {
    return (
      <Card className="min-h-[300px]">
        <CardContent className="p-8 flex justify-center items-center">
          <p className="text-muted-foreground">Selecione um grupo para ver as perguntas</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="min-h-[300px]">
      <CardHeader>
        <h3 className="text-lg font-semibold">{currentGroup.title}</h3>
      </CardHeader>
      <CardContent className="p-8 flex flex-col justify-center items-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-center">
          Nenhuma pergunta disponível neste grupo.<br />
          {questionsCount > 0 ? 
            `Há ${questionsCount} perguntas em outros grupos.` : 
            "Nenhuma pergunta foi definida para este checklist."}
        </p>
      </CardContent>
    </Card>
  );
}
