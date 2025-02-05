import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "./ui/use-toast";

type Company = {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  risk_level: string | null;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  metadata: Json | null;
};

export function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
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
          risk_level: company.risk_level,
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

  const filteredCompanies = companies.filter(company => 
    company.fantasy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm) ||
    company.cnae?.includes(searchTerm)
  );

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

      {filteredCompanies.map((company) => (
        <Card key={company.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {editingCompany?.id === company.id ? (
                  <Input
                    value={editingCompany.fantasy_name || ""}
                    onChange={(e) => setEditingCompany({
                      ...editingCompany,
                      fantasy_name: e.target.value
                    })}
                  />
                ) : (
                  company.fantasy_name || "Nome não informado"
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    company.risk_level === 'Alto' 
                      ? "destructive" 
                      : company.risk_level === 'Médio' 
                      ? "secondary" 
                      : "outline"
                  }
                >
                  Risco {company.risk_level || "Não avaliado"}
                </Badge>
                {editingCompany?.id === company.id ? (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateCompany(editingCompany)}
                  >
                    Salvar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingCompany(company)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>CNPJ: {company.cnpj}</p>
              {editingCompany?.id === company.id ? (
                <>
                  <Input
                    value={editingCompany.cnae || ""}
                    onChange={(e) => setEditingCompany({
                      ...editingCompany,
                      cnae: e.target.value
                    })}
                    placeholder="CNAE"
                    className="mt-2"
                  />
                  <Input
                    value={editingCompany.contact_email || ""}
                    onChange={(e) => setEditingCompany({
                      ...editingCompany,
                      contact_email: e.target.value
                    })}
                    placeholder="Email"
                    className="mt-2"
                  />
                  <Input
                    value={editingCompany.contact_phone || ""}
                    onChange={(e) => setEditingCompany({
                      ...editingCompany,
                      contact_phone: e.target.value
                    })}
                    placeholder="Telefone"
                    className="mt-2"
                  />
                </>
              ) : (
                <>
                  <p>CNAE: {company.cnae || "Não informado"}</p>
                  {company.contact_email && <p>Email: {company.contact_email}</p>}
                  {company.contact_phone && <p>Telefone: {company.contact_phone}</p>}
                </>
              )}
              {company.metadata && typeof company.metadata === 'object' && 'units' in company.metadata && Array.isArray(company.metadata.units) && (
                <p>Unidades: {company.metadata.units.length}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}