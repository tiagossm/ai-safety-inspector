
import { Building2, Info, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Company } from "@/types/company";

interface CompanyCardHeaderProps {
  company: Company;
}

export const CompanyCardHeader = ({ company }: CompanyCardHeaderProps) => {
  const isInactive = company.status === "inactive";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary shrink-0" />
        <h3 className="text-lg font-semibold leading-none truncate">
          {company.fantasy_name}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          {company.cnpj}
        </Badge>
        {company.cnae && (
          <Badge variant="outline" className="text-xs">
            {company.cnae}
          </Badge>
        )}
        <Badge className={cn("text-xs", 
          isInactive ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400" 
          : "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
        )}>
          {isInactive ? "Inativo" : "Ativo"}
        </Badge>
        {company.metadata?.risk_grade && (
          <Badge variant="secondary" className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            Grau de Risco: {company.metadata.risk_grade}
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        {company.contact_email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <a href={`mailto:${company.contact_email}`} className="hover:text-primary truncate">
              {company.contact_email}
            </a>
          </div>
        )}
        {company.contact_phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{company.contact_phone}</span>
          </div>
        )}
      </div>
    </div>
  );
};
