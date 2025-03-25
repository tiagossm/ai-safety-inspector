
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface InspectionCompletionProps {
  loading: boolean;
  stats: {
    total: number;
    answered: number;
    percentage: number;
  };
}

export function InspectionCompletion({ loading, stats }: InspectionCompletionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Progresso</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progresso:</span>
              <span className="text-sm font-medium">{stats.percentage}%</span>
            </div>
            
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.answered} de {stats.total} perguntas respondidas
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
