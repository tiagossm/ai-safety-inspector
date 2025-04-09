
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { useNewChecklists } from "@/hooks/new-checklist/useNewChecklists";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ArrowDownUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NewChecklists: React.FC = () => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState({ id: "", title: "" });
  const navigate = useNavigate();
  
  const {
    checklists,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    companies,
    deleteChecklist,
    updateBulkStatus
  } = useNewChecklists();

  const handleBulkStatusChange = async (ids: string[], newStatus: "active" | "inactive"): Promise<void> => {
    try {
      setIsActionLoading(true);
      await updateBulkStatus(ids, newStatus);
      toast.success(`${ids.length} checklists atualizados com sucesso`);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error updating checklists:", error);
      toast.error("Falha ao atualizar checklists");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenChecklist = (id: string) => {
    navigate(`/new-checklists/${id}`);
  };

  const handleEditChecklist = (id: string) => {
    navigate(`/new-checklists/edit/${id}`);
  };

  const handleDeleteDialog = (id: string, title: string) => {
    setChecklistToDelete({ id, title });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteChecklist(checklistToDelete.id);
      toast.success("Checklist excluído com sucesso");
    } catch (error) {
      console.error("Error deleting checklist:", error);
      toast.error("Erro ao excluir checklist");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      setIsActionLoading(true);
      for (const id of ids) {
        await deleteChecklist(id);
      }
      return true;
    } catch (error) {
      console.error("Error in bulk delete:", error);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Listas de Verificação</h1>
        <Button onClick={() => navigate("/new-checklists/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Novo
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Buscar checklists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setFilterType("all")} className={filterType === "all" ? "bg-accent" : ""}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("active")} className={filterType === "active" ? "bg-accent" : ""}>
                Ativos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("template")} className={filterType === "template" ? "bg-accent" : ""}>
                Templates
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {companies.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  Empresa
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                <DropdownMenuItem onClick={() => setSelectedCompanyId("all")} className={selectedCompanyId === "all" ? "bg-accent" : ""}>
                  Todas as Empresas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {companies.map((company) => (
                  <DropdownMenuItem
                    key={company.id}
                    onClick={() => setSelectedCompanyId(company.id)}
                    className={selectedCompanyId === company.id ? "bg-accent" : ""}
                  >
                    {company.fantasy_name || "Empresa sem nome"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grade</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <ChecklistGrid
            checklists={checklists}
            isLoading={isLoading}
            onEdit={handleEditChecklist}
            onDelete={handleDeleteDialog}
            onOpen={handleOpenChecklist}
            onStatusChange={() => {}} // Refetch is handled by the mutation
            onBulkDelete={handleBulkDelete}
          />
        </TabsContent>
        
        <TabsContent value="list">
          <div className="text-center py-6 text-muted-foreground">
            Visualização em lista estará disponível em breve.
          </div>
        </TabsContent>
      </Tabs>

      <DeleteChecklistDialog
        checklistId={checklistToDelete.id}
        checklistTitle={checklistToDelete.title}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleted={handleDeleteConfirm}
        isDeleting={isActionLoading}
      />
    </div>
  );
};

export default NewChecklists;
