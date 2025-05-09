
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BadgePriority } from "@/components/ui/badge-priority";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Eye, MoreHorizontal, Trash, FileText } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { InspectionDetails } from "@/types/newChecklist";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";

interface InspectionTableProps {
  inspections: InspectionDetails[];
  onView: (id: string) => void;
  onEditInspection?: (id: string) => void;
  onDeleteInspection?: (id: string) => void;
  onGenerateReport?: (id: string) => void;
  selectedInspections?: string[];
  onSelectInspection?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  selectionMode?: boolean;
}

export function InspectionTable({ 
  inspections, 
  onView,
  onEditInspection,
  onDeleteInspection,
  onGenerateReport,
  selectedInspections = [],
  onSelectInspection,
  onSelectAll,
  selectionMode = false
}: InspectionTableProps) {
  if (!inspections.length) {
    return <div className="text-center py-6 text-muted-foreground">Nenhuma inspeção encontrada</div>;
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não agendada";
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "Data inválida";
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  // Map status to badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "completed";
      case "in_progress": return "inProgress";
      default: return "pending";
    }
  };
  
  // Map status to readable text
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Concluído";
      case "in_progress": return "Em progresso";
      default: return "Pendente";
    }
  };
  
  // Map priority to badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high": return "high";
      case "medium": return "medium";
      case "low": return "low";
      default: return "default";
    }
  };
  
  // Map priority to readable text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return "Normal";
    }
  };

  // Verifica se todas as inspeções estão selecionadas
  const allSelected = inspections.length > 0 && selectedInspections.length === inspections.length;
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {selectionMode && onSelectAll && (
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
            )}
            <TableHead>Título</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data Agendada</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspections.map((inspection) => {
            // Verificar se a inspeção está concluída para habilitar relatórios            
            const isCompleted = inspection.status === "completed";
            const isSelected = selectedInspections.includes(inspection.id);
            
            return (
              <TableRow key={inspection.id}>
                {selectionMode && onSelectInspection && (
                  <TableCell className="w-[50px]">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectInspection(inspection.id, !!checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {inspection.title || "Inspeção"}
                </TableCell>
                <TableCell>
                  {inspection.company?.fantasy_name || "N/A"}
                </TableCell>
                <TableCell>
                  {inspection.responsible?.name || "Não atribuído"}
                </TableCell>
                <TableCell>
                  {formatDate(inspection.scheduledDate)}
                </TableCell>
                <TableCell>
                  <BadgePriority variant={getPriorityVariant(inspection.priority)}>
                    {getPriorityText(inspection.priority)}
                  </BadgePriority>
                </TableCell>
                <TableCell>
                  <BadgeStatus variant={getStatusVariant(inspection.status)}>
                    {getStatusText(inspection.status)}
                  </BadgeStatus>
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
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(inspection.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
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
                        
                        {isCompleted && onGenerateReport && (
                          <DropdownMenuItem onClick={() => onGenerateReport(inspection.id)}>
                            <FileText className="mr-2 h-4 w-4" /> Gerar relatório
                          </DropdownMenuItem>
                        )}
                        
                        {onDeleteInspection && (
                          <DropdownMenuItem 
                            onClick={() => onDeleteInspection(inspection.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
