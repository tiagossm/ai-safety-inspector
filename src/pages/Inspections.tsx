
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Filter, 
  Search, 
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useInspections } from "@/hooks/useInspections";
import { EmptyState } from "@/components/inspection/EmptyState";
import { InspectionFilters } from "@/components/inspection/InspectionFilters";
import { InspectionCard } from "@/components/inspection/InspectionCard";
import { InspectionTable } from "@/components/inspection/InspectionTable";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Inspections() {
  const navigate = useNavigate();
  const { inspections, loading, error, fetchInspections, filters, setFilters } = useInspections();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    document.title = "Inspeções | IASST";
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, setFilters]);

  const handleCreateInspection = () => {
    navigate("/new-checklists");
  };

  const handleViewInspection = (id: string) => {
    navigate(`/inspections/${id}/view`);
  };

  const handleRetry = () => {
    fetchInspections();
    toast.success("Atualizando lista de inspeções...");
  };

  return (
    <div className="container py-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inspeções</h2>
          <p className="text-muted-foreground">
            Gerencie suas inspeções e acompanhe o progresso
          </p>
        </div>
        <Button onClick={handleCreateInspection} className="self-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Inspeção
        </Button>
      </div>
      
      <Separator />
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar inspeções..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setFilters({
              search: "",
              status: "all",
              priority: "all",
              companyId: "all",
              responsibleId: "all",
              checklistId: "all",
              startDate: undefined,
              endDate: undefined
            })}
          >
            Limpar Filtros
          </Button>
          
          <InspectionFilters filters={filters} setFilters={setFilters} />
          
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "card" | "table")}>
        <TabsList className="mb-4">
          <TabsTrigger value="card">Cartões</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
        </TabsList>
        
        {error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-medium">Erro ao carregar inspeções</h3>
            </div>
            <p className="text-sm">
              Ocorreu um erro ao carregar os dados. Por favor, tente novamente.
            </p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Tentar novamente
            </Button>
          </div>
        ) : loading ? (
          <div className="p-8 flex justify-center">
            <div className="space-y-4 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Carregando inspeções...</p>
            </div>
          </div>
        ) : inspections.length === 0 ? (
          <EmptyState 
            title="Nenhuma inspeção encontrada"
            description="Você ainda não possui inspeções cadastradas ou que correspondam aos filtros selecionados."
            icon={Filter}
            action={
              <Button onClick={handleCreateInspection}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar nova inspeção
              </Button>
            }
          />
        ) : (
          <>
            <TabsContent value="card" className="mt-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inspections.map((inspection) => (
                    <InspectionCard 
                      key={inspection.id}
                      inspection={inspection}
                      onView={() => handleViewInspection(inspection.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="table" className="mt-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <InspectionTable 
                  inspections={inspections}
                  onView={handleViewInspection}
                />
              </ScrollArea>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
