
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { CompanyCard } from "./CompanyCard";
import { CompanyEditDialog } from "./CompanyEditDialog";

type Company = {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  employee_count: number | null;
  metadata: Json | null;
  created_at: string;
};

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
      setCompanies(data || []);
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

  const handleUpdateCompany = async (company: Company) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          fantasy_name: company.fantasy_name,
          cnae: company.cnae,
          contact_email: company.contact_email,
          contact_phone: company.contact_phone,
        })
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
      });

      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados da empresa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .rpc('archive_company', { company_id: id });

      if (error) throw error;

      setCompanies(prevCompanies => prevCompanies.filter(company => company.id !== id));

      toast({
        title: "Empresa arquivada",
        description: "A empresa foi arquivada com sucesso.",
      });
    } catch (error) {
      console.error('Error archiving company:', error);
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleStartInspection = (company: Company) => {
    navigate(`/inspections/new?company=${company.id}`);
  };

  const handleViewLegalNorms = (company: Company) => {
    navigate(`/legal-norms?company=${company.id}`);
  };

  const filteredCompanies = companies.filter(company => 
    company.fantasy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm) ||
    company.cnae?.includes(searchTerm)
  );

  const displayedCompanies = showAll ? filteredCompanies : filteredCompanies.slice(0, 3);

  if (loading) {
    return <div>Carregando empresas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar empresas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {displayedCompanies.map((company) => (
        <Dialog key={company.id}>
          {editingCompany && (
            <CompanyEditDialog
              company={editingCompany}
              onUpdate={handleUpdateCompany}
            />
          )}
          <CompanyCard
            company={company}
            onDelete={handleDeleteCompany}
            onEdit={setEditingCompany}
            onStartInspection={handleStartInspection}
            onViewLegalNorms={handleViewLegalNorms}
          />
        </Dialog>
      ))}

      {filteredCompanies.length > 3 && !showAll && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAll(true)}
        >
          Ver todas as empresas ({filteredCompanies.length})
        </Button>
      )}
    </div>
  );
}
