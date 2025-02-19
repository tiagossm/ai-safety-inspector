
import { useState, useEffect } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyEditDialog } from "./CompanyEditDialog";
import { CompanyForm } from "./CompanyForm";
import { Company, CompanyStatus } from "@/types/company";
import { Button } from "./ui/button";
import { EmptyCompanyState } from "./company/EmptyCompanyState";
import { CompanySearchFilter } from "./company/CompanySearchFilter";
import { CompaniesGrid } from "./company/CompaniesGrid";

export function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, companies]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const companiesWithMetadata = (data || []).map(company => ({
        ...company,
        status: company.status as CompanyStatus,
        metadata: company.metadata ? company.metadata as Company['metadata'] : null
      })) satisfies Company[];

      setCompanies(companiesWithMetadata);
      setFilteredCompanies(companiesWithMetadata);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erro ao carregar empresas",
        description: "Não foi possível carregar a lista de empresas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    setSearching(true);
    const filtered = companies.filter(company => 
      company.fantasy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj.includes(searchTerm)
    );
    setFilteredCompanies(filtered);
    setSearching(false);
  };

  const handleSearch = () => {
    filterCompanies();
  };

  const handleToggleStatus = async (id: string, newStatus: CompanyStatus) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status da empresa foi atualizado com sucesso.",
      });

      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da empresa.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          status: 'archived',
          deactivated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Empresa arquivada",
        description: "A empresa foi arquivada com sucesso.",
      });

      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleAddUnit = (companyId: string) => {
    navigate(`/companies/${companyId}/units/new`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <CompanySearchFilter 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            searching={searching}
          />
          <Dialog>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Empresa</DialogTitle>
              </DialogHeader>
              <CompanyForm onCompanyCreated={fetchCompanies} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        searchTerm ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum resultado encontrado para "{searchTerm}"</p>
            <Button 
              variant="link" 
              onClick={() => setSearchTerm("")}
              className="mt-2"
            >
              Limpar busca
            </Button>
          </div>
        ) : (
          <EmptyCompanyState onCompanyCreated={fetchCompanies} />
        )
      ) : (
        <CompaniesGrid
          companies={filteredCompanies}
          onEdit={setEditingCompany}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onAddUnit={handleAddUnit}
        />
      )}

      {editingCompany && (
        <CompanyEditDialog
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSave={fetchCompanies}
          open={!!editingCompany}
        />
      )}
    </div>
  );
}
