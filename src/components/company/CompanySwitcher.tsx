
import { useState } from "react";
import { Building, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePlatformCompanies } from "@/hooks/usePlatformData";
import { Loader2 } from "lucide-react";

export function CompanySwitcher() {
  const { companies, loading, switchCompany } = usePlatformCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    localStorage.getItem("impersonated_company_id")
  );

  const handleCompanySwitch = async (companyId: string) => {
    await switchCompany(companyId);
    setSelectedCompanyId(companyId);
  };

  if (loading) {
    return (
      <Button variant="outline" className="w-full justify-start">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando empresas...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            <span>
              {selectedCompanyId
                ? companies.find((c) => c.id === selectedCompanyId)?.name || "Selecionar Empresa"
                : "Selecionar Empresa"}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleCompanySwitch(company.id)}
            className="flex items-center gap-3 py-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                {company.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{company.name}</p>
              <p className="text-xs text-muted-foreground">
                {company.plan_type.toUpperCase()} • {company.users_count || 0} usuários
              </p>
            </div>
            {selectedCompanyId === company.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            localStorage.removeItem("impersonated_company_id");
            setSelectedCompanyId(null);
            window.location.href = "/admin/dashboard";
          }}
          className="justify-center font-medium text-primary"
        >
          Voltar para Visão Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
