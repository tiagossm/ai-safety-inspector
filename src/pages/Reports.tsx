
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, PieChart } from "@/components/ui/chart";
import { FileText, BarChart2, PieChart as PieChartIcon, Download } from "lucide-react";
import CompanyAccessGate from "@/components/billing/CompanyAccessGate";

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
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Exportar</span>
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

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Relatórios</CardTitle>
              <CardDescription>
                Exporte relatórios detalhados em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Relatório de Conformidade</p>
                      <p className="text-sm text-muted-foreground">
                        Análise detalhada da conformidade por categoria
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Relatório de Inspeções</p>
                      <p className="text-sm text-muted-foreground">
                        Resumo de todas as inspeções realizadas
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Excel</span>
                  </Button>
                </div>
                
                <CompanyAccessGate feature="analytics" requiredPlan="pro">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Relatório Executivo</p>
                        <p className="text-sm text-muted-foreground">
                          Indicadores consolidados para gestão executiva
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>PowerPoint</span>
                    </Button>
                  </div>
                </CompanyAccessGate>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
