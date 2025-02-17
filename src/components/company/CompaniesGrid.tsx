
import { Company, CompanyStatus } from "@/types/company";
import { CompanyCard } from "@/components/CompanyCard";

interface CompaniesGridProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onToggleStatus: (id: string, status: CompanyStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEditContact: () => void;
}

export function CompaniesGrid({ 
  companies,
  onEdit,
  onToggleStatus,
  onDelete,
  onEditContact
}: CompaniesGridProps) {
  return (
    <div className="grid gap-4">
      {companies.map(company => (
        <CompanyCard
          key={company.id}
          company={company}
          onEdit={() => onEdit(company)}
          onToggleStatus={() => onToggleStatus(company.id, company.status === 'active' ? 'inactive' : 'active')}
          onDelete={() => onDelete(company.id)}
          onEditContact={onEditContact}
        />
      ))}
    </div>
  );
}
