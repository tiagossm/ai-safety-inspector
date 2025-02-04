import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

type Company = {
  id: string;
  fantasy_name: string;
  cnpj: string;
  risk_level: string;
  cnae: string;
  contact_email: string;
  contact_phone: string;
  metadata: Json | null;
};

export function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Carregando empresas...</div>;
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <Card key={company.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {company.fantasy_name || "Nome não informado"}
              </CardTitle>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>CNPJ: {company.cnpj}</p>
              <p>CNAE: {company.cnae || "Não informado"}</p>
              {company.contact_email && <p>Email: {company.contact_email}</p>}
              {company.contact_phone && <p>Telefone: {company.contact_phone}</p>}
              {company.metadata?.units && Array.isArray(company.metadata.units) && (
                <p>Unidades: {company.metadata.units.length}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}