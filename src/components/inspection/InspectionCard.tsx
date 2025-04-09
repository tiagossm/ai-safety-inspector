
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { InspectionDetails } from '@/types/newChecklist';
import { cn } from '@/lib/utils';

interface InspectionCardProps {
  inspection: InspectionDetails;
  onView?: () => void;
}

export function InspectionCard({ inspection, onView }: InspectionCardProps) {
  // Status badge styling and icon
  const statusConfig = {
    pending: {
      label: 'Pendente',
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      icon: <Clock className="h-3.5 w-3.5 mr-1" />
    },
    in_progress: {
      label: 'Em Andamento',
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
    },
    completed: {
      label: 'Concluído',
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
    }
  };

  // Priority badge styling
  const priorityConfig = {
    low: {
      label: 'Baixa',
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    },
    medium: {
      label: 'Média',
      color: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
    },
    high: {
      label: 'Alta',
      color: 'bg-red-100 text-red-800 hover:bg-red-200'
    }
  };

  const status = statusConfig[inspection.status] || statusConfig.pending;
  const priority = priorityConfig[inspection.priority] || priorityConfig.medium;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex space-x-2">
            <Badge variant="outline" className={status.color}>
              {status.icon}
              {status.label}
            </Badge>
            
            <Badge variant="outline" className={priority.color}>
              {priority.label}
            </Badge>
          </div>
        </div>
        
        <h3 className="font-semibold text-lg line-clamp-2 mt-2">
          {inspection.title}
        </h3>
        
        {inspection.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {inspection.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="text-sm space-y-3 flex-grow">
        {inspection.companyName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Empresa:</span>
            <span className="font-medium">{inspection.companyName}</span>
          </div>
        )}
        
        {inspection.responsibleName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Responsável:</span>
            <span className="font-medium">{inspection.responsibleName}</span>
          </div>
        )}
        
        {inspection.scheduledDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data:</span>
            <span className="font-medium">
              {format(new Date(inspection.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        )}
        
        {inspection.locationName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Local:</span>
            <span className="font-medium line-clamp-1">{inspection.locationName}</span>
          </div>
        )}
        
        <div className="pt-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium">Progresso</span>
            <span className="text-xs font-medium">{inspection.progress}%</span>
          </div>
          <Progress value={inspection.progress} className={cn(
            inspection.progress >= 100 ? "bg-green-100" : "bg-blue-100",
            "h-2"
          )} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onView}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
