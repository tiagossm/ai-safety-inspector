
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
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-medium">Carregando perguntas...</h3>
          <p className="text-sm text-muted-foreground">Aguarde enquanto carregamos os dados da inspeção.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentGroupId) {
    return (
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium">Nenhum grupo selecionado</h3>
          <p className="text-sm text-muted-foreground">
            Selecione um grupo no menu lateral para visualizar as perguntas.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (questionsCount === 0) {
    return (
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Checklist sem perguntas</h3>
          <p className="text-sm text-muted-foreground">
            Este checklist não possui perguntas cadastradas.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-12 flex flex-col items-center justify-center">
        <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">
          {currentGroup ? `Nenhuma pergunta no grupo ${currentGroup.title}` : "Nenhuma pergunta para exibir"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentGroup
            ? "Este grupo não possui perguntas cadastradas."
            : "Selecione um grupo no menu lateral para visualizar as perguntas."}
        </p>
      </CardContent>
    </Card>
  );
}
