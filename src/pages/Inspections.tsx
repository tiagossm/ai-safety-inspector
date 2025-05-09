
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Filter, 
  Search, 
  RefreshCw,
  AlertTriangle,
  LayoutGrid,
  List,
  FileDown,
  CalendarDays
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useInspections } from "@/hooks/useInspections";
import { useInspectionPagination } from "@/hooks/inspection/useInspectionPagination";
import { EmptyState } from "@/components/inspection/EmptyState";
import { InspectionFilters } from "@/components/inspection/InspectionFilters";
import { InspectionCard } from "@/components/inspection/InspectionCard";
import { InspectionTable } from "@/components/inspection/InspectionTable";
import { InspectionPagination } from "@/components/inspection/InspectionPagination";
import { InspectionDashboard } from "@/components/inspection/InspectionDashboard";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Inspections() {
  const navigate = useNavigate();
  const { inspections, loading, error, fetchInspections, filters, setFilters } = useInspections();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { 
    currentPage, 
    pageSize, 
    totalPages,
    totalItems,
    paginatedInspections, 
    handlePageChange, 
    handlePageSizeChange 
  } = useInspectionPagination({ inspections });
  
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

  const handleExportData = () => {
    // Este seria implementado com uma função real de exportação
    toast.info("Funcionalidade de exportação será implementada em breve");
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
      
      {!loading && !error && inspections.length > 0 && (
        <InspectionDashboard inspections={inspections} />
      )}
      
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
        
        <div className="flex flex-wrap items-center gap-2">
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
          
          <div className="flex items-center">
            <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "card" | "table")} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card" className="px-3">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="table" className="px-3">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <FileDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportData}>
                Exportar como Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportData}>
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportData}>
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
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
        <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "card" | "table")}>
          <TabsContent value="card">
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedInspections.map((inspection) => (
                  <InspectionCard 
                    key={inspection.id}
                    inspection={inspection}
                    onView={() => handleViewInspection(inspection.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="table">
            <ScrollArea className="h-[calc(100vh-420px)]">
              <InspectionTable 
                inspections={paginatedInspections}
                onView={handleViewInspection}
              />
            </ScrollArea>
          </TabsContent>
          
          <InspectionPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Tabs>
      )}
    </div>
  );
}
