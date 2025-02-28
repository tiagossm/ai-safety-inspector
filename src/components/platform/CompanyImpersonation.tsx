
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building, LogOut, User } from "lucide-react";
import { usePlatformCompanies } from "@/hooks/usePlatformData";
import { useAuth } from "@/components/AuthProvider";

export function CompanyImpersonation() {
  const { companies, loading, switchCompany } = usePlatformCompanies();
  const { user, logout } = useAuth();
  
  // Get current impersonated company
  const currentCompanyId = typeof window !== "undefined" 
    ? localStorage.getItem("impersonated_company_id") 
    : null;
  
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  
  const exitImpersonation = () => {
    localStorage.removeItem("impersonated_company_id");
    window.location.href = "/admin/dashboard";
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          {currentCompany ? (
            <>
              <Building className="h-4 w-4" />
              <span>{currentCompany.name}</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span>{user?.email || "Admin"}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Acessar Como:</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <DropdownMenuItem disabled>Carregando empresas...</DropdownMenuItem>
        ) : (
          companies.map(company => (
            <DropdownMenuItem 
              key={company.id}
              onClick={() => switchCompany(company.id)}
              className={company.id === currentCompanyId ? "bg-primary/10" : ""}
            >
              <Building className="mr-2 h-4 w-4" />
              <span className="flex-1 truncate">{company.name}</span>
              {company.id === currentCompanyId && (
                <span className="text-xs text-muted-foreground">(Atual)</span>
              )}
            </DropdownMenuItem>
          ))
        )}
        
        {currentCompanyId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exitImpersonation}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Voltar para Admin</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
