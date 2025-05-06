
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, PieChart } from "@/components/ui/chart";
import { FileText, BarChart2, PieChart as PieChartIcon, Download, ClipboardList } from "lucide-react";
import CompanyAccessGate from "@/components/billing/CompanyAccessGate";
import { ReportsHistory } from "@/components/reports/ReportsHistory";

export default function Reports() {
  // Dados de exemplo para os gráficos
  const complianceData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        label: "Taxa de Conformidade",
        data: [78, 82, 80, 85, 88, 92],
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgb(59, 130, 246)",
      },
    ],
  };

  const issueTypeData = {
    labels: ["EPI", "Procedimentos", "Documentação", "Equipamentos", "Sinalização"],
    datasets: [
      {
        data: [25, 30, 15, 20, 10],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(139, 92, 246, 0.7)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(245, 158, 11)",
          "rgb(16, 185, 129)",
          "rgb(239, 68, 68)",
          "rgb(139, 92, 246)",
        ],
      },
    ],
  };

  const actionPlanStatusData = {
    labels: ["Pendente", "Em Andamento", "Concluído", "Cancelado"],
    datasets: [
      {
        data: [35, 25, 30, 10],
        backgroundColor: [
          "rgba(245, 158, 11, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderColor: [
          "rgb(245, 158, 11)",
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(239, 68, 68)",
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Analise os dados das inspeções e auditorias realizadas
        </p>
      </div>

      <Tabs defaultValue="compliance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Conformidade</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span>Não Conformidades</span>
          </TabsTrigger>
          <TabsTrigger value="action-plans" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Planos de Ação</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conformidade</CardTitle>
              <CardDescription>
                Evolução da taxa de conformidade nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyAccessGate feature="analytics" requiredPlan="pro">
                <BarChart data={complianceData} height={350} />
              </CompanyAccessGate>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Não Conformidades</CardTitle>
              <CardDescription>
                Distribuição dos tipos de problemas identificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyAccessGate feature="analytics" requiredPlan="pro">
                <PieChart data={issueTypeData} height={350} />
              </CompanyAccessGate>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Planos de Ação</CardTitle>
              <CardDescription>
                Distribuição dos planos de ação por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyAccessGate feature="analytics" requiredPlan="pro">
                <PieChart data={actionPlanStatusData} height={350} />
              </CompanyAccessGate>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ReportsHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
