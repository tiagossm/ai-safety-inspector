
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";

interface InspectionHeaderProps {
  title: string;
  description?: string;
  status: string;
  stats: {
    percentage: number;
    answered: number;
    total: number;
  };
  viewMode?: "read" | "edit";
  onToggleViewMode?: () => void;
}

export function InspectionHeader({
  title,
  description,
  status,
  stats,
  viewMode = "edit",
  onToggleViewMode
}: InspectionHeaderProps) {
  // Define status badge color based on status
  const getStatusColor = () => {
    switch (status) {
      case "Concluída":
        return "bg-green-100 text-green-800 border-green-200";
      case "Em Andamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pendente":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="p-4 mb-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">{title}</h1>
            <Badge variant="outline" className={getStatusColor()}>
              {status}
            </Badge>
          </div>
          
          {description && (
            <p className="text-muted-foreground text-sm mb-2">{description}</p>
          )}
          
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Progresso</span>
              <span className="text-muted-foreground">
                {stats.answered}/{stats.total} perguntas ({stats.percentage}%)
              </span>
            </div>
            <Progress value={stats.percentage} className="h-2" />
          </div>
        </div>
        
        {onToggleViewMode && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleViewMode}
              className="flex items-center gap-2"
            >
              {viewMode === "edit" ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Modo Leitura</span>
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  <span>Modo Edição</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
