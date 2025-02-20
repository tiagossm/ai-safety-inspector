
import { Button } from "@/components/ui/button";
import { useCompanyForm } from "@/hooks/useCompanyForm";
import { CNPJInput } from "@/components/company/form/CNPJInput";
import { CompanyBasicFields } from "@/components/company/form/CompanyBasicFields";
import { CompanyContactFields } from "@/components/company/form/CompanyContactFields";
import { useAuth } from "@/components/AuthProvider";

interface CompanyFormProps {
  onCompanyCreated?: () => void;
}

export function CompanyForm({ onCompanyCreated }: CompanyFormProps) {
  const { formState, handlers, getRiskLevelVariant } = useCompanyForm(onCompanyCreated);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    if (!user) return;
    handlers.handleSubmit(e, user.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 max-w-2xl mx-auto">
      <CNPJInput
        cnpj={formState.cnpj}
        loading={formState.loading}
        onChange={handlers.handleCNPJChange}
        onBlur={handlers.handleCNPJBlur}
      />

      <CompanyBasicFields
        fantasyName={formState.fantasyName}
        cnae={formState.cnae}
        riskLevel={formState.riskLevel}
        address={formState.address}
        getRiskLevelVariant={getRiskLevelVariant}
      />

      <CompanyContactFields
        contactName={formState.contactName}
        contactPhone={formState.contactPhone}
        contactEmail={formState.contactEmail}
      />

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          disabled={!formState.cnpj || !formState.fantasyName || formState.loading}
        >
          {formState.loading ? "Carregando..." : "Cadastrar Empresa"}
        </Button>
      </div>
    </form>
  );
}
