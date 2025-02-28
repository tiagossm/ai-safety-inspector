
import { Company, CompanyStatus } from "@/types/company";
import { CompanyCard } from "@/components/CompanyCard";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CompaniesGridProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onToggleStatus: (id: string, status: CompanyStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddUnit: (id: string) => void;
}

type SortOption = 'name' | 'date' | 'employees';

export function CompaniesGrid({ 
  companies,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddUnit
}: CompaniesGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Aplicar filtros
  const filteredCompanies = companies.filter(company => {
    if (filterStatus === 'all') return true;
    return company.status === filterStatus;
  });
  
  // Aplicar ordenação
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.fantasy_name || '').localeCompare(b.fantasy_name || '');
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'employees':
        const aCount = a.employee_count || 0;
        const bCount = b.employee_count || 0;
        return bCount - aCount;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/40 p-3 rounded-md">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label htmlFor="sortBy">Ordenar por</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger id="sortBy" className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="date">Data de cadastro</SelectItem>
                <SelectItem value="employees">Nº de funcionários</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="filterStatus">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filterStatus" className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {sortedCompanies.length} {sortedCompanies.length === 1 ? 'empresa' : 'empresas'} encontrada{sortedCompanies.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6">
        {sortedCompanies.map(company => (
          <div key={company.id} className="h-full">
            <CompanyCard
              company={company}
              onEdit={() => onEdit(company)}
              onToggleStatus={() => onToggleStatus(company.id, company.status === 'active' ? 'inactive' : 'active')}
              onDelete={() => onDelete(company.id)}
              onAddUnit={() => onAddUnit(company.id)}
            />
          </div>
        ))}
      </div>
      
      {sortedCompanies.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          Nenhuma empresa corresponde aos filtros selecionados.
        </div>
      )}
    </div>
  );
}
