
import { Company, CompanyStatus } from "@/types/company";
import { CompanyCard } from "@/components/CompanyCard";

interface CompaniesGridProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onToggleStatus: (id: string, status: CompanyStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddUnit: (id: string) => void;
}

export function CompaniesGrid({ 
  companies,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddUnit
}: CompaniesGridProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
      {companies.map(company => (
        <CompanyCard
          key={company.id}
          company={company}
          onEdit={() => onEdit(company)}
          onToggleStatus={() => onToggleStatus(company.id, company.status === 'active' ? 'inactive' : 'active')}
          onDelete={() => onDelete(company.id)}
          onAddUnit={() => onAddUnit(company.id)}
        />
      ))}
    </div>
  );
}
