
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  Users, 
  Building, 
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from "lucide-react";

export default function Dashboard() {
  // Dados de exemplo para os gráficos
  const inspectionData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        label: "Concluídas",
        data: [25, 30, 35, 40, 45, 50],
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "rgb(34, 197, 94)",
      },
      {
        label: "Pendentes",
        data: [15, 10, 12, 8, 5, 10],
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        borderColor: "rgb(234, 179, 8)",
      },
    ],
  };

  const riskData = {
    labels: ["Baixo", "Médio", "Alto", "Crítico"],
    datasets: [
      {
        data: [40, 30, 20, 10],
        backgroundColor: [
          "rgba(34, 197, 94, 0.7)",
          "rgba(234, 179, 8, 0.7)",
          "rgba(249, 115, 22, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(249, 115, 22)",
          "rgb(239, 68, 68)",
        ],
      },
    ],
  };

  const complianceData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        label: "Taxa de Conformidade",
        data: [78, 82, 80, 85, 88, 92],
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgb(59, 130, 246)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Dados para os cartões de resumo
  const summaryData = [
    {
      title: "Inspeções Totais",
      value: "128",
      description: "+8% em relação ao mês anterior",
      icon: ClipboardCheck,
      color: "text-blue-500",
    },
    {
      title: "Não Conformidades",
      value: "23",
      description: "-4% em relação ao mês anterior",
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      title: "Inspeções Pendentes",
      value: "12",
      description: "5 com prazo próximo ao vencimento",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Taxa de Conformidade",
      value: "92%",
      description: "+3% em relação ao mês anterior",
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  // Lista de inspeções recentes
  const recentInspections = [
    {
      id: "1",
      title: "Inspeção NR-12 - Maquinário",
      company: "Indústria ABC",
      date: "2023-11-15",
      status: "Concluída",
      conformity: "95%",
    },
    {
      id: "2",
      title: "Inspeção NR-6 - EPIs",
      company: "Construções XYZ",
      date: "2023-11-12",
      status: "Concluída",
      conformity: "88%",
    },
    {
      id: "3",
      title: "Avaliação Ergonômica",
      company: "Escritórios DEF",
      date: "2023-11-10",
      status: "Pendente",
      conformity: "",
    },
    {
      id: "4",
      title: "Inspeção NR-10 - Instalações Elétricas",
      company: "Tecnologia JKL",
      date: "2023-11-08",
      status: "Concluída",
      conformity: "92%",
    },
  ];

  // Função para obter a classe de cor baseada no status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Reprovada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema de gestão de inspeções
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Inspeções por Mês</CardTitle>
                <CardDescription>
                  Número de inspeções concluídas e pendentes nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart data={inspectionData} height={350} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribuição de Riscos</CardTitle>
                <CardDescription>
                  Classificação dos riscos identificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart data={riskData} height={350} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Inspeções Recentes</CardTitle>
                <CardDescription>
                  Últimas inspeções realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInspections.map((inspection) => (
                    <div key={inspection.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{inspection.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {inspection.company} • {new Date(inspection.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {inspection.conformity && (
                          <Badge variant="outline">{inspection.conformity}</Badge>
                        )}
                        <Badge className={getStatusClass(inspection.status)}>
                          {inspection.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline">Ver Todas</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Taxa de Conformidade</CardTitle>
                <CardDescription>
                  Evolução da conformidade nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart data={complianceData} height={350} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Empresas Monitoradas
                </CardTitle>
                <Building className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  +3 novas empresas este mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Ativos
                </CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">
                  65% de taxa de engajamento
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Checklists Ativos
                </CardTitle>
                <FileText className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  8 templates compartilhados
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Comparativo</CardTitle>
              <CardDescription>
                Análise comparativa de conformidade entre setores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] grid place-items-center">
                <p className="text-muted-foreground">
                  Visualização avançada de análise de dados disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>
                Relatórios personalizados para análise de inspeções
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Relatório de Conformidade</p>
                      <p className="text-sm text-muted-foreground">
                        Análise detalhada de conformidade por norma
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Gerar</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Relatório Mensal de Inspeções</p>
                      <p className="text-sm text-muted-foreground">
                        Resumo de todas as inspeções do mês
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Gerar</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Análise de Não Conformidades</p>
                      <p className="text-sm text-muted-foreground">
                        Detalhamento de problemas e planos de ação
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Gerar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
