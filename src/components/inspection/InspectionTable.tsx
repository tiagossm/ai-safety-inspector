
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { InspectionDetails } from "@/types/newChecklist";
import { Eye, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface InspectionTableProps {
  inspections: InspectionDetails[];
  onView: (id: string) => void;
}

export function InspectionTable({ inspections, onView }: InspectionTableProps) {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Título</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Prioridade</TableHead>
          <TableHead className="text-right">Progresso</TableHead>
          <TableHead className="w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {inspections.map((inspection) => {
          const status = statusConfig[inspection.status] || statusConfig.pending;
          const priority = priorityConfig[inspection.priority] || priorityConfig.medium;
          
          return (
            <TableRow key={inspection.id}>
              <TableCell className="font-medium">{inspection.title}</TableCell>
              <TableCell>{inspection.companyName || '-'}</TableCell>
              <TableCell>{inspection.responsibleName || '-'}</TableCell>
              <TableCell>
                {inspection.scheduledDate ? 
                  format(new Date(inspection.scheduledDate), 'dd/MM/yyyy', { locale: ptBR }) : 
                  '-'}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={status.color}>
                  {status.icon}
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={priority.color}>
                  {priority.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {inspection.progress}%
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(inspection.id)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalhes</span>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
