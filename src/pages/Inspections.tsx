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
  CalendarDays,
  Trash
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
import { DeleteInspectionDialog } from "@/components/inspection/DeleteInspectionDialog";
import { ReportGenerationDialog } from "@/components/inspection/ReportGenerationDialog";
import { deleteInspection, deleteMultipleInspections } from "@/services/inspection/inspectionService";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export default function Inspections() {
  const navigate = useNavigate();
  const { inspections, loading, error, fetchInspections, filters, setFilters } = useInspections();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedInspections, setSelectedInspections] = useState<string[]>([]);
  
  // Estados para excluir inspeção
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<{ id: string; title?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  
  // Estado para diálogo de relatório
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [inspectionForReport, setInspectionForReport] = useState<{ id: string; data: any } | null>(null);
  
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

  // Limpa a seleção quando mudar de página ou ao recarregar os dados
  useEffect(() => {
    setSelectedInspections([]);
  }, [inspections, currentPage]);

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

  const handleOpenDeleteDialog = (id: string, title?: string) => {
    setInspectionToDelete({ id, title });
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!inspectionToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteInspection(inspectionToDelete.id);
      if (success) {
        toast.success("Inspeção excluída com sucesso");
        fetchInspections(); // Recarrega a lista após exclusão
      }
    } catch (error: any) {
      toast.error("Erro ao excluir inspeção", {
        description: error.message
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setInspectionToDelete(null);
    }
  };
  
  // Função para lidar com a exclusão em lote
  const handleBatchDelete = async () => {
    if (selectedInspections.length === 0) return;
    
    setIsBatchDeleting(true);
    try {
      const result = await deleteMultipleInspections(selectedInspections);
      
      if (result.success) {
        toast.success(`${result.successCount} inspeções excluídas com sucesso`);
      } else if (result.successCount > 0) {
        toast.success(`${result.successCount} inspeções excluídas com sucesso`);
        toast.error(`Falha ao excluir ${result.errorCount} inspeções`);
      } else {
        toast.error(`Falha ao excluir inspeções`);
      }
      
      // Recarrega a lista e limpa a seleção
      fetchInspections();
      setSelectedInspections([]);
      setSelectionMode(false);
    } catch (error: any) {
      toast.error("Erro ao excluir inspeções", {
        description: error.message
      });
    } finally {
      setIsBatchDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  const handleOpenReportDialog = (id: string) => {
    const inspection = inspections.find(insp => insp.id === id);
    if (inspection) {
      setInspectionForReport({ id, data: inspection });
      setReportDialogOpen(true);
    } else {
      toast.error("Inspeção não encontrada");
    }
  };

  const handleExportData = () => {
    toast.info("Selecione uma inspeção concluída para gerar um relatório");
  };
  
  // Funções para lidar com seleção
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedInspections([]);
    }
  };
  
  const handleSelectInspection = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedInspections(prev => [...prev, id]);
    } else {
      setSelectedInspections(prev => prev.filter(inspId => inspId !== id));
    }
  };
  
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = paginatedInspections.map(insp => insp.id);
      setSelectedInspections(allIds);
    } else {
      setSelectedInspections([]);
    }
  };

  // Verifica se há itens selecionados
  const hasSelected = selectedInspections.length > 0;
  
  // Verifica se todos os itens da página atual estão selecionados
  const isAllSelected = paginatedInspections.length > 0 && 
    selectedInspections.length === paginatedInspections.length;

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
          {/* Botão de modo seleção */}
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={toggleSelectionMode}
          >
            <Checkbox className="mr-2 h-4 w-4" checked={selectionMode} />
            {selectionMode ? "Cancelar Seleção" : "Modo Seleção"}
          </Button>
          
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
      
      {/* Barra de ações para itens selecionados */}
      {hasSelected && (
        <div className="bg-accent rounded-md p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox 
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              className="mr-2 h-4 w-4"
            />
            <span>{selectedInspections.length} {selectedInspections.length === 1 ? 'item selecionado' : 'itens selecionados'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isBatchDeleting}
            >
              <Trash className="mr-2 h-4 w-4" />
              Excluir Selecionados
            </Button>
          </div>
        </div>
      )}
      
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
                    onDelete={() => handleOpenDeleteDialog(inspection.id, inspection.title)}
                    onGenerateReport={inspection.status === "completed" ? 
                      () => handleOpenReportDialog(inspection.id) : undefined}
                    isSelected={selectedInspections.includes(inspection.id)}
                    onSelect={(selected) => handleSelectInspection(inspection.id, selected)}
                    selectionMode={selectionMode}
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
                onDeleteInspection={(id) => {
                  const inspection = paginatedInspections.find(i => i.id === id);
                  handleOpenDeleteDialog(id, inspection?.title);
                }}
                onGenerateReport={(id) => {
                  const inspection = paginatedInspections.find(i => i.id === id);
                  if (inspection?.status === "completed") {
                    handleOpenReportDialog(id);
                  } else {
                    toast.info("Apenas inspeções concluídas podem gerar relatórios");
                  }
                }}
                selectedInspections={selectedInspections}
                onSelectInspection={handleSelectInspection}
                onSelectAll={handleSelectAll}
                selectionMode={selectionMode}
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

      {/* Diálogo de confirmação de exclusão */}
      <DeleteInspectionDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={hasSelected ? handleBatchDelete : handleConfirmDelete}
        inspectionTitle={inspectionToDelete?.title}
        loading={isDeleting || isBatchDeleting}
        isMultiple={hasSelected}
        selectedCount={selectedInspections.length}
      />
      
      {/* Diálogo de geração de relatórios */}
      {inspectionForReport && (
        <ReportGenerationDialog
          inspectionId={inspectionForReport.id}
          inspectionData={inspectionForReport.data}
          onOpenChange={setReportDialogOpen}
        />
      )}
    </div>
  );
}
