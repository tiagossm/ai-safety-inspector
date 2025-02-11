
import { Badge } from "@/components/ui/badge";
import { Company } from "@/types/company";
import { isMatriz } from "@/utils/companyUtils";

interface CompanyDetailsProps {
  company: Company;
}

export function CompanyDetails({ company }: CompanyDetailsProps) {
  return (
    <div className="text-sm text-muted-foreground space-y-1">
      <p>CNPJ: {company.cnpj}</p>
      <p>CNAE: {company.cnae || "Não informado"}</p>
      {company.employee_count && (
        <p>Funcionários: {company.employee_count}</p>
      )}
      {company.contact_email && <p>Email: {company.contact_email}</p>}
      {company.contact_phone && <p>Telefone: {company.contact_phone}</p>}
      {company.contact_name && <p>Contato: {company.contact_name}</p>}
      <p>Data de cadastro: {new Date(company.created_at).toLocaleDateString()}</p>
    </div>
  );
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
    </div>
  );
}
