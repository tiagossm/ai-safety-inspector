
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CompanyEditDialog } from "./CompanyEditDialog";
import { CompanyForm } from "./CompanyForm";
import { Company, CompanyStatus } from "@/types/company";
import { Button } from "./ui/button";
import { EmptyCompanyState } from "./company/EmptyCompanyState";
import { CompanySearchFilter } from "./company/CompanySearchFilter";
import { CompaniesGrid } from "./company/CompaniesGrid";

export function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompanies(data as Company[]);
    } catch (error) {
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
    } catch (error) {
      console.error('Error updating company status:', error);
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
    } catch (error) {
      console.error('Error archiving company:', error);
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
  };

  const handleEditContact = () => {
    toast({
      title: "Editar contato",
      description: "Funcionalidade em desenvolvimento."
    });
  };

  const filteredCompanies = companies.filter(company => 
    company.fantasy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (companies.length === 0) {
    return <EmptyCompanyState onCompanyCreated={fetchCompanies} />;
  }

  return (
    <div className="space-y-4">
      <CompanySearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <CompaniesGrid
        companies={filteredCompanies}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onEditContact={handleEditContact}
      />

      <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
        {editingCompany && (
          <CompanyEditDialog
            company={editingCompany}
            onClose={() => setEditingCompany(null)}
            onSave={fetchCompanies}
            open={!!editingCompany}
          />
        )}
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg"
            data-dialog-trigger="new-company"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
          </DialogHeader>
          <CompanyForm onCompanyCreated={fetchCompanies} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
