
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, ClipboardList, Pencil, Trash2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Company } from "@/types/company";
import { generateCompanyPDF } from "@/utils/pdfGenerator";
import { formatCNPJ } from "@/utils/formatters";
import { CompanyDetails, CompanyTitle } from "./company/CompanyDetails";
import { CompanyContacts } from "./company/CompanyContacts";
import { CompanyUnits } from "./company/CompanyUnits";

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onAddUnit: () => void;
}

export const CompanyCard = ({ 
  company,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddUnit
}: CompanyCardProps) => {
  const isInactive = company.status === "inactive";

  return (
    <Card className="bg-background text-foreground rounded-lg border border-border hover:shadow-md transition-shadow w-full max-w-7xl mx-auto">
      <CardHeader className="border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="space-y-2">
          <CompanyTitle company={company} />
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="font-mono">
              CNPJ: {formatCNPJ(company.cnpj)}
            </Badge>
            {company.cnae && <Badge variant="outline">CNAE: {company.cnae}</Badge>}
            <Badge variant="secondary" className="font-mono">
              Grau de Risco: {company.metadata?.risk_grade || 'Não classificado'}
            </Badge>
            <Badge 
              className={cn(
                "text-sm",
                isInactive
                  ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400"
                  : "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
              )}
            >
              {isInactive ? "Inativo" : "Ativo"}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar Empresa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Empresa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CompanyDetails company={company} />
            <CompanyContacts company={company} />
          </div>
          
          <CompanyUnits company={company} onAddUnit={onAddUnit} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
          <Button className="flex-1">
            <ClipboardList className="h-4 w-4 mr-2" />
            Nova Inspeção
          </Button>
          <Button variant="secondary" className="flex-1">
            <Zap className="h-4 w-4 mr-2" />
            Dimensionar NRs com IA
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => generateCompanyPDF(company)}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
