
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

interface InspectionHeaderProps {
  title: string;
  description: string;
  status: string;
  stats: {
    percentage: number;
    answered: number;
    total: number;
  };
}

export function InspectionHeader({
  title,
  description,
  status,
  stats
}: InspectionHeaderProps) {
  // Get status color based on the inspection status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída":
      case "Completed":
        return "bg-green-500";
      case "Em Andamento":
      case "In Progress":
        return "bg-amber-500";
      case "Pendente":
      case "Pending":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Badge className={`${getStatusColor(status)} text-white`}>{status}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>Progresso</span>
          <span className="font-medium">{stats.answered}/{stats.total} ({stats.percentage}%)</span>
        </div>
        <Progress value={stats.percentage} className="h-2" />
      </div>
    </div>
  );
}
