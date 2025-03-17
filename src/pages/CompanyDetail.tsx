
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setCompany(data);
      } catch (error) {
        console.error('Error fetching company:', error);
        toast.error('Erro ao carregar dados da empresa');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg">Empresa não encontrada</div>
        <Button onClick={() => navigate('/companies')}>Voltar para Empresas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{company.fantasy_name || 'Empresa sem nome'}</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                <p>{company.cnpj || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CNAE</p>
                <p>{company.cnae || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                <p>{company.address || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de Funcionários</p>
                <p>{company.employee_count || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome do Contato</p>
              <p>{company.contact_name || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{company.contact_email || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Telefone</p>
              <p>{company.contact_phone || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
