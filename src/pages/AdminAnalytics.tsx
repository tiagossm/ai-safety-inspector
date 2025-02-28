
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/metrics/MetricCard";
import { PlatformHealthMonitor } from "@/components/platform/PlatformHealthMonitor";
import { BarChart, LineChart, PieChart, AreaChart } from "lucide-react";

// Mocked data for demonstration
const mockPerformanceData = [
  { month: "Jan", users: 230, inspections: 340, companies: 12 },
  { month: "Fev", users: 250, inspections: 380, companies: 14 },
  { month: "Mar", users: 300, inspections: 450, companies: 16 },
  { month: "Abr", users: 340, inspections: 560, companies: 22 },
  { month: "Mai", users: 380, inspections: 610, companies: 28 },
  { month: "Jun", users: 450, inspections: 640, companies: 31 }
];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("6months");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Global</h1>
          <p className="text-muted-foreground">
            Relatórios e métricas da plataforma IASST
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="3months">Últimos 3 meses</SelectItem>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
            <SelectItem value="year">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Usuários Totais" 
          value={2340} 
          trend="up"
          trendValue="+12% (143)"
        />
        <MetricCard 
          title="Empresas Ativas" 
          value={31} 
          trend="up"
          trendValue="+16% (5)"
        />
        <MetricCard 
          title="Inspeções Realizadas" 
          value={6407} 
          trend="up"
          trendValue="+34% (1623)"
        />
        <MetricCard 
          title="MRR" 
          value={28750} 
          format="currency"
          trend="up"
          trendValue="+21% (R$ 5.000)"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento da Plataforma</CardTitle>
            <CardDescription>Evolução dos principais indicadores</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              <LineChart className="h-16 w-16" />
              <p className="ml-4">Dados do gráfico de crescimento serão renderizados aqui.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Receita por Plano</CardTitle>
            <CardDescription>Distribuição de receita por tipo de plano</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              <PieChart className="h-16 w-16" />
              <p className="ml-4">Dados do gráfico de receita serão renderizados aqui.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="activity">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="retention">Retenção</TabsTrigger>
          <TabsTrigger value="saude">Saúde</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Atividade da Plataforma</CardTitle>
              <CardDescription>Volume de inspeções e operações</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex h-80 items-center justify-center text-muted-foreground">
                <BarChart className="h-16 w-16" />
                <p className="ml-4">Dados do gráfico de atividade serão renderizados aqui.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Retenção de Clientes</CardTitle>
              <CardDescription>Análise de retenção e cancelamentos</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex h-80 items-center justify-center text-muted-foreground">
                <AreaChart className="h-16 w-16" />
                <p className="ml-4">Dados do gráfico de retenção serão renderizados aqui.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saude">
          <PlatformHealthMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
