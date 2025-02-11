
import { Button } from "@/components/ui/button";
import { ClipboardList, Zap, ChevronDown, ChevronUp, Download, PencilIcon, Trash2 } from "lucide-react";
import { Company } from "@/types/company";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompanyActionsProps {
  company: Company;
  unitsExpanded: boolean;
  unitsCount: number;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onStartInspection: (company: Company) => void;
  onViewLegalNorms: (company: Company) => void;
  onToggleUnits: () => void;
  onExportCSV: () => void;
}

export function CompanyActions({
  company,
  unitsExpanded,
  unitsCount,
  onDelete,
  onEdit,
  onStartInspection,
  onViewLegalNorms,
  onToggleUnits,
  onExportCSV,
}: CompanyActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onStartInspection(company)}
      >
        <ClipboardList className="h-4 w-4 mr-2" />
        Iniciar Inspeção
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onViewLegalNorms(company)}
      >
        <Zap className="h-4 w-4 mr-2" />
        Dimensione NRs com IA
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onToggleUnits}
      >
        {unitsExpanded ? (
          <ChevronUp className="h-4 w-4 mr-2" />
        ) : (
          <ChevronDown className="h-4 w-4 mr-2" />
        )}
        {unitsCount} Unidades
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onExportCSV}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar CSV
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja arquivar esta empresa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(company.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
