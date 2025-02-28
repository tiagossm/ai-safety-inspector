
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, Search, Filter, CheckCircle2, Calendar, User, Building } from "lucide-react";
import CompanyAccessGate from "@/components/billing/CompanyAccessGate";

export default function Incidents() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Dados fictícios de incidentes
  const incidents = [
    {
      id: "INC-001",
      title: "Extintores com validade vencida",
      company: "Empresa ABC",
      createdAt: "2023-11-15",
      status: "open",
      priority: "high",
      assignedTo: "Carlos Silva"
    },
    {
      id: "INC-002",
      title: "EPI danificado - Setor de produção",
      company: "Indústria XYZ",
      createdAt: "2023-11-12",
      status: "in_progress",
      priority: "medium",
      assignedTo: "Ana Souza"
    },
    {
      id: "INC-003",
      title: "Vazamento na tubulação de gás",
      company: "Gás e Energia Ltda",
      createdAt: "2023-11-10",
      status: "closed",
      priority: "critical",
      assignedTo: "Pedro Santos"
    },
    {
      id: "INC-004",
      title: "Sinalização de emergência ausente",
      company: "Comércio e Serviços ME",
      createdAt: "2023-11-08",
      status: "open",
      priority: "low",
      assignedTo: "Maria Oliveira"
    },
  ];

  // Função para obter variante do badge de status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open": return "warning";
      case "in_progress": return "default";
      case "closed": return "success";
      default: return "secondary";
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "Aberto";
      case "in_progress": return "Em Andamento";
      case "closed": return "Resolvido";
      default: return status;
    }
  };

  // Função para obter variante do badge de prioridade
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "low": return "secondary";
      case "medium": return "default";
      case "high": return "warning";
      case "critical": return "destructive";
      default: return "secondary";
    }
  };

  // Função para obter texto da prioridade
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low": return "Baixa";
      case "medium": return "Média";
      case "high": return "Alta";
      case "critical": return "Crítica";
      default: return priority;
    }
  };

  // Filtrar incidentes
  const filteredIncidents = incidents.filter(incident => {
    // Filtrar por texto de pesquisa
    const matchesSearch = 
      incident.title.toLowerCase().includes(search.toLowerCase()) || 
      incident.company.toLowerCase().includes(search.toLowerCase()) ||
      incident.assignedTo.toLowerCase().includes(search.toLowerCase());
    
    // Filtrar por status
    const matchesStatus = 
      statusFilter === "all" || 
      incident.status === statusFilter;
    
    // Filtrar por prioridade
    const matchesPriority = 
      priorityFilter === "all" || 
      incident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <CompanyAccessGate feature="inspections" requiredPlan="pro">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ocorrências</h2>
            <p className="text-muted-foreground">
              Gerencie e acompanhe as não conformidades e incidentes registrados
            </p>
          </div>
          <Button className="self-start">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Nova Ocorrência
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center flex-1 gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ocorrências..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="closed">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="cards" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
            
            <p className="text-sm text-muted-foreground">
              {filteredIncidents.length} {filteredIncidents.length === 1 ? 'ocorrência' : 'ocorrências'}
            </p>
          </div>

          <TabsContent value="cards">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredIncidents.map((incident) => (
                <Card key={incident.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant={getStatusVariant(incident.status)}>
                        {getStatusText(incident.status)}
                      </Badge>
                      <Badge variant={getPriorityVariant(incident.priority)}>
                        {getPriorityText(incident.priority)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <CardDescription>{incident.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Criado em: {new Date(incident.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Responsável: {incident.assignedTo}
                      </span>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0 mt-auto">
                    <Button variant="secondary" className="w-full">Ver Detalhes</Button>
                  </div>
                </Card>
              ))}
            </div>
            
            {filteredIncidents.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma ocorrência encontrada</h3>
                <p className="text-muted-foreground">
                  Registre uma nova ocorrência ou ajuste os filtros de busca.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            <div className="rounded-md border overflow-hidden">
              <div className="grid grid-cols-7 bg-muted/50 p-3 font-medium">
                <div className="col-span-2">Título</div>
                <div>Empresa</div>
                <div>Data</div>
                <div>Status</div>
                <div>Prioridade</div>
                <div>Responsável</div>
              </div>
              <div className="divide-y">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="grid grid-cols-7 p-3 items-center hover:bg-muted/30">
                    <div className="col-span-2 font-medium">{incident.title}</div>
                    <div className="truncate">{incident.company}</div>
                    <div>{new Date(incident.createdAt).toLocaleDateString()}</div>
                    <div>
                      <Badge variant={getStatusVariant(incident.status)}>
                        {getStatusText(incident.status)}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={getPriorityVariant(incident.priority)}>
                        {getPriorityText(incident.priority)}
                      </Badge>
                    </div>
                    <div className="truncate">{incident.assignedTo}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {filteredIncidents.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma ocorrência encontrada</h3>
                <p className="text-muted-foreground">
                  Registre uma nova ocorrência ou ajuste os filtros de busca.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CompanyAccessGate>
  );
}
