
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
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-4">
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
