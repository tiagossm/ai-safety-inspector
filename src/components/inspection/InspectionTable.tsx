
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
import { InspectionDetails } from "@/types/newChecklist";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionTableProps {
  inspections: (InspectionDetails & {
    company?: {
      name?: string;
      fantasy_name?: string;
    };
    responsible?: {
      name?: string;
    };
    progress?: number;
  })[];
  onView: (id: string) => void;
}

export function InspectionTable({ inspections, onView }: InspectionTableProps) {
  const formatDate = (date: string | undefined) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Concluída</Badge>;
      case "in_progress":
        return <Badge variant="default">Em progresso</Badge>;
      case "pending":
      default:
        return <Badge variant="warning">Pendente</Badge>;
    }
  };

  const getPriorityIndicator = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Alta prioridade" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-500" aria-label="Média prioridade" />;
      case "low":
        return <AlertTriangle className="h-4 w-4 text-green-500" aria-label="Baixa prioridade" />;
      default:
        return null;
    }
  };

  const getCompanyName = (inspection: InspectionTableProps["inspections"][0]) => {
    if (!inspection.company) return "—";
    return inspection.company.fantasy_name || inspection.company.name || "Empresa sem nome";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Prioridade</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspections.map((inspection) => (
            <TableRow key={inspection.id}>
              <TableCell className="text-center">
                {getPriorityIndicator(inspection.priority)}
              </TableCell>
              <TableCell className="font-medium">
                {inspection.title || "Sem título"}
              </TableCell>
              <TableCell>{getCompanyName(inspection)}</TableCell>
              <TableCell>{inspection.responsible?.name || "—"}</TableCell>
              <TableCell>{getStatusBadge(inspection.status)}</TableCell>
              <TableCell>
                {typeof inspection.progress === 'number' 
                  ? `${inspection.progress}%` 
                  : '—'
                }
              </TableCell>
              <TableCell>{formatDate(inspection.scheduledDate)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(inspection.id)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
