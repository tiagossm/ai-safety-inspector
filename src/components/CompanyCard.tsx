import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, ClipboardList, Pencil, Trash2, Zap, PlusCircle, Edit } from "lucide-react";
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
  onEditContact: () => void;
}

export const CompanyCard = ({ 
  company,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddUnit,
  onEditContact
}: CompanyCardProps) => {
  const isInactive = company.status === "inactive";

  return (
    <Card className="bg-background text-foreground rounded-lg border border-border hover:shadow-md transition-shadow w-full max-w-6xl mx-auto">
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
            
