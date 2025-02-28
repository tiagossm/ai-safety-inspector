
import { Badge } from "@/components/ui/badge";
import { Company } from "@/types/company";
import { isMatriz } from "@/utils/companyUtils";
import { formatPhone } from "@/utils/formatters";
import { MapPin, User, Briefcase, Calendar, Mail, Phone } from "lucide-react";

interface CompanyDetailsProps {
  company: Company;
}

export function CompanyDetails({ company }: CompanyDetailsProps) {
  return (
    <div className="text-sm text-muted-foreground space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-muted-foreground opacity-70" />
        <p>CNPJ: {company.cnpj}</p>
      </div>
      
      {company.cnae && (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground opacity-70" />
          <p>CNAE: {company.cnae}</p>
          {company.metadata?.risk_grade && (
            <Badge variant={getRiskBadgeVariant(company.metadata.risk_grade)}>
              Grau de Risco {company.metadata.risk_grade}
            </Badge>
          )}
        </div>
      )}
      
      {company.address && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground opacity-70" />
          <p>{company.address}</p>
        </div>
      )}
      
      {company.employee_count && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground opacity-70" />
          <p>Funcionários: {company.employee_count}</p>
          {showCIPAInfo(company) && (
            <Badge variant="outline">
              {getCIPARequirement(company)}
            </Badge>
          )}
        </div>
      )}
      
      {company.contact_email && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground opacity-70" />
          <a href={`mailto:${company.contact_email}`} className="hover:underline">
            {company.contact_email}
          </a>
        </div>
      )}
      
      {company.contact_phone && (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground opacity-70" />
          <p>{formatPhone(company.contact_phone)}</p>
        </div>
      )}
      
      {company.contact_name && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground opacity-70" />
          <p>Contato: {company.contact_name}</p>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground opacity-70" />
        <p>Data de cadastro: {new Date(company.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

// Função auxiliar para obter a variante do badge baseado no grau de risco
function getRiskBadgeVariant(riskGrade: string): "success" | "warning" | "destructive" {
  const grade = parseInt(riskGrade);
  if (grade <= 2) return "success";
  if (grade === 3) return "warning";
  return "destructive";
}

// Função auxiliar para mostrar informação da CIPA
function showCIPAInfo(company: Company): boolean {
  return (
    !!company.employee_count && 
    !!company.metadata?.risk_grade
  );
}

// Função auxiliar para obter o requisito da CIPA
function getCIPARequirement(company: Company): string {
  if (!company.employee_count || !company.metadata?.risk_grade) return "";
  
  if (company.employee_count < 20) {
    return "Designar 1 representante da CIPA";
  }
  
  if (company.metadata?.cipa_dimensioning) {
    const cipa = company.metadata.cipa_dimensioning;
    if (typeof cipa === 'object' && 'efetivos' in cipa) {
      return `CIPA: ${cipa.efetivos} membros, ${cipa.suplentes} suplentes`;
    }
  }
  
  return "CIPA obrigatória";
}

export function CompanyTitle({ company }: CompanyDetailsProps) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-lg font-semibold">
        {company.fantasy_name || "Nome não informado"}
      </h3>
      <Badge variant={isMatriz(company.cnpj) ? "default" : "secondary"}>
        {isMatriz(company.cnpj) ? "Matriz" : "Filial"}
      </Badge>
      <Badge variant={company.status === 'active' ? 'success' : 'destructive'}>
        {company.status === 'active' ? 'Ativo' : 'Inativo'}
      </Badge>
    </div>
  );
}
