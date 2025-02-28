
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlatformData } from "@/hooks/usePlatformData";
import { PlatformHealthMonitor } from "./PlatformHealthMonitor";
import { formatCurrency } from "@/utils/formatters";
import { MetricCard } from "../metrics/MetricCard";

export function SuperAdminDashboard() {
  const { companies, users, metrics, loading } = usePlatformData();
  
  const editCompany = (company: any) => {
    console.log("Edit company:", company);
  };
  
  const impersonateCompany = (company: any) => {
    console.log("Impersonate company:", company);
    localStorage.setItem("impersonated_company_id", company.id);
    window.location.href = "/dashboard";
  };
  
  if (loading) {
    return <div>Carregando dados da plataforma...</div>;
  }
  
  return (
    <div className="space-y-8">
      <PlatformHealthMonitor />
      
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral do Ecossistema</CardTitle>
          <CardDescription>Métricas principais da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              title="Empresas Ativas" 
              value={metrics.active_companies} 
              trend="up"
              trendValue="+12% mês"
            />
            <MetricCard 
              title="Inspeções/Mês" 
              value={metrics.total_inspections}
              trend="up"
              trendValue="+8% mês"
            />
            <MetricCard 
              title="MRR" 
              value={metrics.mrr} 
              format="currency"
              trend="up"
              trendValue="+5% mês"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="companies" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Gerenciadas</CardTitle>
              <CardDescription>Lista de empresas na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 p-3 bg-muted/50 font-medium">
                  <div className="col-span-2">Empresa</div>
                  <div>Plano</div>
                  <div>Usuários</div>
                  <div>Status</div>
                  <div>Ações</div>
                </div>
                <div className="divide-y">
                  {companies.map((company) => (
                    <div key={company.id} className="grid grid-cols-6 p-3 items-center">
                      <div className="col-span-2 font-medium">{company.name}</div>
                      <div>
                        <Badge className={`${
                          company.plan_type === 'free' ? 'bg-gray-500 hover:bg-gray-600' : 
                          company.plan_type === 'pro' ? 'bg-blue-500 hover:bg-blue-600' : 
                          'bg-green-500 hover:bg-green-600'
                        }`}>
                          {company.plan_type.toUpperCase()}
                        </Badge>
                      </div>
                      <div>{company.users_count || 0}</div>
                      <div>
                        <Badge variant={company.subscription_active ? "success" : "destructive"}>
                          {company.subscription_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => editCompany(company)}>
                          Editar
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => impersonateCompany(company)}>
                          Acessar Como
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {companies.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma empresa encontrada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Faturamento</CardTitle>
              <CardDescription>Relatórios de receita e assinaturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 grid place-items-center">
                <p className="text-muted-foreground">Relatórios de faturamento estarão disponíveis em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="support" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Central de Suporte</CardTitle>
              <CardDescription>Gerenciamento de tickets e atendimento ao cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 grid place-items-center">
                <p className="text-muted-foreground">Central de suporte estará disponível em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
