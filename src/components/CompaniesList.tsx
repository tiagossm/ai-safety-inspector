
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { CompanyCard } from "./CompanyCard";
import { CompanyEditDialog } from "./CompanyEditDialog";
import { Company, CompanyStatus, CompanyMetadata } from "@/types/company";

export function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showAll, setShowAll] = useState(false);
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

      const convertedData: Company[] = (data || []).map(item => ({
        ...item,
        metadata: item.metadata as CompanyMetadata | null,
        status: item.status as CompanyStatus
      }));

      setCompanies(convertedData);
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
    return <div>Carregando...</div>;
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
          />
        ))}
      </div>

      <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
        {editingCompany && (
          <CompanyEditDialog
            company={editingCompany}
            onClose={() => setEditingCompany(null)}
            onSave={fetchCompanies}
          />
        )}
      </Dialog>
    </div>
  );
}
