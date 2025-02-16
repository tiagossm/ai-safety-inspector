import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical,
  ClipboardList,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Company } from "@/types/company";
import { generateCompanyPDF, exportAllCompaniesReport } from "@/utils/pdfGenerator";
import { formatCNPJ, formatPhone } from "@/utils/formatters";
import { useState } from "react";

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
  const [isInactive, setIsInactive] = useState(company.status === "inactive");
  const [copied, setCopied] = useState(false);

  const handleExportPDF = async () => {
    try {
      await generateCompanyPDF(company);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  const handleExportAllCompanies = async () => {
    try {
      await exportAllCompaniesReport();
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
    }
  };

  const handleCopyEmail = () => {
    if (company.contact_email) {
      navigator.clipboard.writeText(company.contact_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleInactive = () => {
    setIsInactive(!isInactive);
    onToggleStatus();
  };

  return (
    <Card className="bg-background text-foreground rounded-lg border border-border hover:shadow-md transition-shadow">
      {/* Cabeçalho */}
      <CardHeader className="border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{company.fantasy_name}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="font-mono">
              CNPJ: {formatCNPJ(company.cnpj)}
            </Badge>
            {company.cnae && <Badge variant="outline">CNAE: {company.cnae}</Badge>}
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

        {/* Menu de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <span className="flex items-center">
                <Pencil className="h-4 w-4 mr-2" />
                Editar Empresa
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <span className="flex items-center text-red-600 dark:text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Empresa
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Conteúdo Principal */}
      <CardContent className="p-6 space-y-8">
        {/* Seção de Contato */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contato Principal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span className="font-medium">{company.contact_name || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {company.contact_email ? (
                <>
                  <a href={`mailto:${company.contact_email}`} className="hover:underline">
                    {company.contact_email}
                  </a>
                  <Button variant="ghost" size="icon" onClick={handleCopyEmail}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  {copied && <span className="text-xs text-green-500">Copiado!</span>}
                </>
              ) : (
                <span>Não informado</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <span>{company.contact_phone ? formatPhone(company.contact_phone) : 'Não informado'}</span>
            </div>
          </div>
        </div>

        {/* Dados Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Funcionários</h3>
            <div className="p-4 bg-muted rounded-lg">
              <span className="text-2xl font-bold">
                {company.employee_count || "Não informado"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Grau de Risco (NR 4)</h3>
            <div className="p-4 bg-muted rounded-lg">
              <span className="text-2xl font-bold">
                {company.metadata?.risk_grade || 'Não classificado'}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
          <Button className="flex-1">
            <ClipboardList className="h-4 w-4 mr-2" />
            Nova Inspeção
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleExportAllCompanies}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Caixa de seleção para inativar */}
        <div className="flex items-center gap-2 pt-4">
          <input type="checkbox" checked={isInactive} onChange={handleToggleInactive} />
          <span className="text-sm">Inativar Empresa</span>
        </div>
      </CardContent>
    </Card>
  );
};
