
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { formatInspectionStatus } from "@/utils/formatInspectionStatus";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { InspectionDetails } from "@/types/newChecklist";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionTableProps {
  inspections: InspectionDetails[];
  onViewInspection: (id: string) => void;
  onEditInspection?: (id: string) => void;
  onDeleteInspection?: (id: string) => void;
}

export function InspectionTable({ 
  inspections, 
  onViewInspection,
  onEditInspection,
  onDeleteInspection
}: InspectionTableProps) {
  if (!inspections.length) {
    return <div className="text-center py-6 text-muted-foreground">Nenhuma inspeção encontrada</div>;
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data Agendada</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspections.map((inspection) => {
            const statusInfo = formatInspectionStatus(inspection.status);
            
            return (
              <TableRow key={inspection.id}>
                <TableCell className="font-medium">
                  {inspection.title}
                </TableCell>
                <TableCell>
                  {inspection.company?.fantasy_name || "N/A"}
                </TableCell>
                <TableCell>
                  {inspection.responsible?.name || "N/A"}
                </TableCell>
                <TableCell>
                  {formatDate(inspection.scheduledDate)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={statusInfo.label === "Concluído" ? "default" : "outline"}
                    className={`${statusInfo.label === "Concluído" ? "" : `text-${statusInfo.color}-500 border-${statusInfo.color}-200`}`}
                  >
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {typeof inspection.progress === 'number' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${inspection.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{inspection.progress}%</span>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onViewInspection(inspection.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {(onEditInspection || onDeleteInspection) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEditInspection && (
                            <DropdownMenuItem onClick={() => onEditInspection(inspection.id)}>
                              Editar
                            </DropdownMenuItem>
                          )}
                          {onDeleteInspection && (
                            <DropdownMenuItem 
                              onClick={() => onDeleteInspection(inspection.id)}
                              className="text-red-500 focus:text-red-500"
                            >
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
