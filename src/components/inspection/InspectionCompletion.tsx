
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface InspectionCompletionProps {
  loading: boolean;
  stats: {
    total: number;
    answered: number;
    percentage: number;
  };
}

export function InspectionCompletion({ loading, stats }: InspectionCompletionProps) {
  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-1 px-4 pt-4">
          <CardTitle className="text-base font-medium">
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Determine color based on completion percentage
  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-amber-500";
    return "bg-green-500";
  };
  
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-1 px-4 pt-4">
        <CardTitle className="text-base font-medium text-gray-800">Progresso</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completado</span>
            <span className="text-sm font-medium">{stats.percentage}%</span>
          </div>
          <Progress 
            value={stats.percentage} 
            className="h-2"
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{stats.answered} de {stats.total} perguntas</span>
            <span>{stats.total - stats.answered} restantes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
