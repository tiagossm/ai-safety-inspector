import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Filter, AlertTriangle, CheckCircle, Clock, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionPlan } from "@/types/inspection";

interface ActionPlanWithRelations extends ActionPlan {
  inspection?: {
    id: string;
    company?: {
      fantasy_name: string;
    };
  };
  question?: {
    pergunta: string;
  };
}

export default function ActionPlans() {
  const [actionPlans, setActionPlans] = useState<ActionPlanWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    fetchActionPlans();
  }, []);

  const fetchActionPlans = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("inspection_action_plans")
        .select(`
          *,
          inspection:inspection_id (
            id,
            company:company_id (fantasy_name)
          ),
          question:question_id (pergunta)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Type casting to ensure the data matches our extended interface
      setActionPlans(data as ActionPlanWithRelations[] || []);
    } catch (error) {
      console.error("Error fetching action plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActionPlans = actionPlans.filter(plan => {
    // Apply search filter
    const searchMatch = search === "" || 
      plan.description.toLowerCase().includes(search.toLowerCase()) ||
      plan.assignee?.toLowerCase().includes(search.toLowerCase()) ||
      plan.inspection?.company?.fantasy_name.toLowerCase().includes(search.toLowerCase()) ||
      plan.question?.pergunta.toLowerCase().includes(search.toLowerCase());
    
    // Apply status filter
    const statusMatch = statusFilter === "all" || plan.status === statusFilter;
    
    // Apply priority filter
    const priorityMatch = priorityFilter === "all" || plan.priority === priorityFilter;
    
    return searchMatch && statusMatch && priorityMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pendente</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Em Andamento</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Concluído</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Baixa</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Média</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Alta</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Crítica</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "low":
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <Ban className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Planos de Ação</h2>
        <p className="text-muted-foreground">
          Gerencie e acompanhe os planos de ação para corrigir não conformidades
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os planos de ação por status, prioridade ou pesquise por texto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar planos de ação..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Status: {statusFilter === "all" ? "Todos" : statusFilter}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Prioridade: {priorityFilter === "all" ? "Todas" : priorityFilter}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planos de Ação</CardTitle>
          <CardDescription>
            {filteredActionPlans.length} planos de ação encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-md">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActionPlans.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">Nenhum plano de ação encontrado</h3>
              <p className="text-muted-foreground">
                Ajuste os filtros ou crie novos planos de ação a partir das inspeções
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data Limite</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActionPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="max-w-md">
                        <div className="flex items-start gap-2">
                          {getPriorityIcon(plan.priority)}
                          <div>
                            <span className="font-medium line-clamp-1">{plan.description}</span>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {plan.question?.pergunta}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.inspection?.company?.fantasy_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(plan.status)}
                          {getStatusBadge(plan.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(plan.priority)}
                      </TableCell>
                      <TableCell>
                        {plan.due_date ? formatDate(plan.due_date) : "Não definida"}
                      </TableCell>
                      <TableCell>
                        {plan.assignee || "Não atribuído"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
