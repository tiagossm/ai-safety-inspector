
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useChecklists } from "@/hooks/useChecklists";

export function ChecklistsDashboard() {
  const { checklists, isLoading } = useChecklists();
  
  // Contagem de checklists por categoria
  const categoryCounts = checklists.reduce((acc: Record<string, number>, checklist) => {
    const category = checklist.category || "Não categorizado";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value
  }));
  
  // Contagem de checklists por status
  const statusCounts = {
    ativo: checklists.filter(c => c.status_checklist === "ativo").length,
    inativo: checklists.filter(c => c.status_checklist === "inativo").length,
    template: checklists.filter(c => c.is_template).length
  };
  
  const statusData = [
    { name: "Ativos", value: statusCounts.ativo },
    { name: "Inativos", value: statusCounts.inativo },
    { name: "Templates", value: statusCounts.template }
  ];

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  if (isLoading) {
    return <div className="py-10 text-center">Carregando dados...</div>;
  }
  
  if (checklists.length === 0) {
    return (
      <div className="py-10 text-center">
        <h3 className="text-lg font-medium mb-2">Sem dados disponíveis</h3>
        <p className="text-muted-foreground">
          Crie alguns checklists para visualizar estatísticas e métricas.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Total de Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{checklists.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Checklists Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statusCounts.ativo}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statusCounts.template}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Por Status</TabsTrigger>
          <TabsTrigger value="category">Por Categoria</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} checklists`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 40,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip formatter={(value) => [`${value} checklists`, ""]} />
                  <Bar dataKey="value" fill="#8884d8">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
