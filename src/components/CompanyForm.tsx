
import { Button } from "@/components/ui/button";
import { BasicInfo } from "./company/BasicInfo";
import { ContactInfo } from "./company/ContactInfo";
import { UnitsList } from "./company/UnitsList";
import { useCompanyForm } from "@/hooks/useCompanyForm";
import { formatCNPJ } from "@/utils/formatters";

interface CompanyFormProps {
  onCompanyCreated?: () => void;
}

export function CompanyForm({ onCompanyCreated }: CompanyFormProps) {
  const { formState, formHandlers } = useCompanyForm(onCompanyCreated);
  
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    formHandlers.handleCNPJChange({
      ...e,
      target: { ...e.target, value: formattedCNPJ },
    });
  };

  return (
    <form onSubmit={formHandlers.handleSubmit} className="space-y-8">
      <BasicInfo
        cnpj={formState.cnpj}
        fantasyName={formState.fantasyName}
        cnae={formState.cnae}
        riskLevel={formState.riskLevel}
        employeeCount={formState.employeeCount}
        onCNPJChange={handleCNPJChange}
        onFantasyNameChange={(e) => formHandlers.setFantasyName(e.target.value)}
        onCNAEChange={formHandlers.handleCNAEChange}
        onEmployeeCountChange={(e) => formHandlers.setEmployeeCount(e.target.value)}
      />

      <ContactInfo
        contactName={formState.contactName}
        contactEmail={formState.contactEmail}
        contactPhone={formState.contactPhone}
        onContactNameChange={(e) => formHandlers.setContactName(e.target.value)}
        onContactEmailChange={(e) => formHandlers.setContactEmail(e.target.value)}
        onContactPhoneChange={(e) => formHandlers.setContactPhone(e.target.value)}
      />

      <UnitsList
        units={formState.units}
        onAddUnit={formHandlers.addUnit}
        onUpdateUnit={formHandlers.updateUnit}
      />

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={formState.loading}>
          {formState.loading ? "Cadastrando..." : "Cadastrar Empresa"}
        </Button>
      </div>
    </form>
  );
}
