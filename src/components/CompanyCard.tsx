import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical,
  ClipboardList,
  Zap,
  DownloadCloud,
  PlusCircle,
  User,
  Mail,
  Phone,
  Building,
  Star,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Company, Contact } from "@/types/company";
import { generateCompanyPDF } from "@/utils/pdfGenerator";
import { formatCNPJ, formatPhone } from "@/utils/formatters";
import { useState } from "react";

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
  onToggleStatus: () => void;
  onAddUnit: () => void;
}

export const CompanyCard = ({ 
  company,
  onEdit,
  onToggleStatus,
  onAddUnit
}: CompanyCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleExportPDF = async () => {
    try {
      await generateCompanyPDF(company);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(company.contact_email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn(
      "bg-background text-foreground rounded-lg",
      "border border-border hover:shadow-md transition-shadow w-full"
    )}>
      {/* Cabeçalho */}
      <CardHeader className="border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{company.fantasy_name}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="font-mono">
              CNPJ: {formatCNPJ(company.cnpj)}
            </Badge>
            <Badge variant="outline">CNAE: {company.cnae}</Badge>
            <Badge 
              className={cn(
                "text-sm",
                company.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
              )}
            >
              {company.status === 'active' ? 'Ativo' : 'Inativo'}
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
            <DropdownMenuItem onClick={onToggleStatus}>
              <span className="flex items-center text-red-600 dark:text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                {company.status === 'active' ? 'Inativar' : 'Reativar'}
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
              <span className="font-medium">{company.contact_name}</span>
              {company.is_focal && <Star className="h-5 w-5 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <a 
                href={`mailto:${company.contact_email}`} 
                className="hover:underline"
              >
                {company.contact_email}
              </a>
              <Button variant="ghost" size="icon" onClick={handleCopyEmail}>
                <Copy className="h-4 w-4" />
              </Button>
              {copied && <span className="text-xs text-green-500">Copiado!</span>}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <span>{formatPhone(company.contact_phone)}</span>
            </div>
          </div>
        </div>

        {/* Dados Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Funcionários</h3>
            <div className="p-4 bg-muted rounded-lg">
              <span className="text-2xl font-bold">
                {company.employee_count || 'Não informado'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Grau de Risco (NR 4)</h3>
            <div className="p-4 bg-muted rounded-lg">
              <span className="text-2xl font-bold">
                {company.risk_grade || 'Não classificado'}
              </span>
            </div>
          </div>
        </div>

        {/* Unidades */}
        <div className="space-y-4">
          <div className="
