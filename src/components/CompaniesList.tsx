import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Building2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CompanyCard } from "./CompanyCard";
import { CompanyEditDialog } from "./CompanyEditDialog";
import { Company, CompanyStatus } from "@/types/company";
import { Button } from "./ui/button";

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

  const handleAddUnit = (companyId: string) => {
    navigate(`/companies/${companyId}/units/new`);
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-6xl animate-bounce">👻</div>
        <h3 className="text-xl font-semibold text-center">
          Nenhuma empresa cadastrada
        </h3>
        <p className="text-muted-foreground text-center">
          Comece adicionando sua primeira empresa!
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="mt-4">
              <Building2 className="mr-2 h-5 w-5" />
              Adicionar Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
            </DialogHeader>
            <CompanyForm onCompanyCreated={fetchCompanies} />
          </DialogContent>
        </Dialog>
        
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg"
          onClick={() => document.querySelector<HTMLButtonElement>('[data-dialog-trigger="new-company"]')?.click()}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome ou CNPJ..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredCompanies.map(company => (
          <CompanyCard
            key={company.id}
            company={company}
            onEdit={() => handleEdit(company)}
            onToggleStatus={() => handleToggleStatus(company.id, company.status === 'active' ? 'inactive' : 'active')}
            onAddUnit={() => handleAddUnit(company.id)}
            onDelete={() => handleDelete(company.id)}
          />
        ))}
      </div>

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
