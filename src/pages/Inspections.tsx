
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Inspections() {
  // Estados para filtros e pesquisa
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Dados de exemplo para inspeções
  const inspections = [
    {
      id: "1",
      title: "Inspeção Semestral - Unidade Principal",
      companyName: "Empresa Teste Ltda",
      status: "Pendente",
      date: "2023-11-15",
      approvalStatus: "pending"
    },
    {
      id: "2",
      title: "Verificação de EPI - Setor de Produção",
      companyName: "Indústria ABC",
      status: "Concluída",
      date: "2023-11-10",
      approvalStatus: "approved"
    },
    {
      id: "3",
      title: "Avaliação de Risco - Escritório Central",
      companyName: "Consultoria XYZ",
      status: "Em Andamento",
      date: "2023-11-20",
      approvalStatus: "awaiting_approval"
    },
    {
      id: "4",
      title: "Checklist NR12 - Maquinário",
      companyName: "Fábrica Modelo S.A.",
      status: "Concluída",
      date: "2023-11-05",
      approvalStatus: "rejected"
    },
  ];

  // Função para obter variante do badge de status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pendente": return "warning";
      case "Concluída": return "success";
      case "Em Andamento": return "default";
      default: return "secondary";
    }
  };

  // Função para obter variante do badge de aprovação
  const getApprovalVariant = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "awaiting_approval": return "warning";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  // Função para obter texto de status de aprovação
  const getApprovalText = (status: string) => {
    switch (status) {
      case "approved": return "Aprovado";
      case "awaiting_approval": return "Aguardando Aprovação";
      case "rejected": return "Rejeitado";
      case "pending": return "Pendente";
      default: return status;
    }
  };

  // Filtrar inspeções
  const filteredInspections = inspections.filter(inspection => {
    // Filtrar por texto de pesquisa
    const matchesSearch = 
      inspection.title.toLowerCase().includes(search.toLowerCase()) || 
      inspection.companyName.toLowerCase().includes(search.toLowerCase());
    
    // Filtrar por status
    const matchesStatus = 
      statusFilter === "all" || 
      inspection.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Ordenar inspeções
  const sortedInspections = [...filteredInspections].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "alpha") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inspeções</h2>
          <p className="text-muted-foreground">
            Gerencie suas inspeções e checklists
          </p>
        </div>
        <Button className="self-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Inspeção
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center flex-1 gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar inspeções..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex flex-1 gap-2">
          <div className="flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="em andamento">Em Andamento</SelectItem>
                <SelectItem value="concluída">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigas</SelectItem>
                <SelectItem value="alpha">Alfabética</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sortedInspections.map((inspection) => (
            <Card key={inspection.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={getStatusVariant(inspection.status)}>
                    {inspection.status}
                  </Badge>
                  <Badge variant={getApprovalVariant(inspection.approvalStatus)}>
                    {getApprovalText(inspection.approvalStatus)}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{inspection.title}</CardTitle>
                <CardDescription>{inspection.companyName}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Data: {new Date(inspection.date).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="secondary" className="w-full">Ver Detalhes</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {sortedInspections.length === 0 && (
          <div className="text-center py-10">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma inspeção encontrada</h3>
            <p className="text-muted-foreground">Crie uma nova inspeção ou ajuste os filtros de busca.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
