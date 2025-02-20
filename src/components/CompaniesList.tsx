
import { Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompanyEditDialog } from "./CompanyEditDialog";
import { Company } from "@/types/company";
import { EmptyCompanyState } from "./company/EmptyCompanyState";
import { CompanySearchFilter } from "./company/CompanySearchFilter";
import { CompaniesGrid } from "./company/CompaniesGrid";
import { EmptyState } from "./company/EmptyState";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyActions } from "@/hooks/useCompanyActions";
import { useState } from "react";
import { Button } from "./ui/button";

export function CompaniesList() {
  const { 
    companies, 
    loading, 
    searching, 
    searchTerm,
    searchType, 
    setSearchTerm,
    setSearchType,
    refresh 
  } = useCompanies();
  
  const { toggleStatus, deleteCompany } = useCompanyActions();
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const navigate = useNavigate();

  const handleAddUnit = (companyId: string) => {
    navigate(`/companies/${companyId}/units/new`);
  };

  const handleAddCompany = () => {
    // Implementar lógica para adicionar empresa
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full flex justify-between items-center gap-4 px-4">
            <CompanySearchFilter 
              searchTerm={searchTerm}
              searchType={searchType}
              onSearchChange={setSearchTerm}
              onSearchTypeChange={setSearchType}
              onSearch={() => {}} // A busca agora é automática
              searching={searching}
            />
            <Button 
              onClick={handleAddCompany}
              size="lg"
              className="hidden sm:flex whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Empresa
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4">
        {companies.length === 0 ? (
          searchTerm ? (
            <EmptyState
              searchTerm={searchTerm}
              onClearSearch={() => setSearchTerm("")}
            />
          ) : (
            <EmptyCompanyState onCompanyCreated={refresh} />
          )
        ) : (
          <CompaniesGrid
            companies={companies}
            onEdit={setEditingCompany}
            onToggleStatus={toggleStatus}
            onDelete={deleteCompany}
            onAddUnit={handleAddUnit}
          />
        )}
      </div>

      <Button 
        onClick={handleAddCompany}
        size="lg"
        className="fixed bottom-4 right-4 sm:hidden shadow-lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Nova Empresa
      </Button>

      {editingCompany && (
        <CompanyEditDialog
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSave={refresh}
          open={!!editingCompany}
        />
      )}
    </div>
  );
}
