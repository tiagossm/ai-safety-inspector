import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  RefreshCw,
  ClipboardList,
  AlertTriangle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInspections } from "@/hooks/useInspections";
import { InspectionFilters } from "@/components/inspection/InspectionFilters";
import { InspectionCard } from "@/components/inspection/InspectionCard";
import { InspectionTable } from "@/components/inspection/InspectionTable";
import { EmptyState } from "@/components/inspection/EmptyState";
import { toast } from "sonner";

export default function Inspections() {
  const navigate = useNavigate();
  const location = useLocation();
  const { inspections, loading, error, fetchInspections, filters, setFilters } = useInspections();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  useEffect(() => {
    document.title = "Inspeções | IASST";

    // Se veio de uma finalização de inspeção, recarrega a lista
    if (location.state?.refresh) {
      fetchInspections();
      toast.success("Inspeções atualizadas com sucesso");
      window.history.replaceState({}, document.title); // limpa o state
    }
  }, [location.state]);

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

      <InspectionFilters filters={filters} setFilters={setFilters} />

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
            icon={ClipboardList}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspections.map((inspection) => (
                  <InspectionCard
                    key={inspection.id}
                    inspection={inspection}
                    onView={() => handleViewInspection(inspection.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <InspectionTable
                inspections={inspections}
                onView={handleViewInspection}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
