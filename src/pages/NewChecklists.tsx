import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowLeft } from "lucide-react";
import { useChecklists } from "@/hooks/new-checklist/useChecklists";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { ChecklistTabs } from "@/components/new-checklist/ChecklistTabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistWithStats } from "@/types/newChecklist";

export default function NewChecklists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>(
    localStorage.getItem('checklist-active-tab') || "active"
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    checklistId: string;
    checklistTitle: string;
  }>({
    isOpen: false,
    checklistId: "",
    checklistTitle: "",
  });

  const {
    data: templates,
    isLoading: templatesLoading,
    refreshChecklists: refreshTemplates,
  } = useChecklists({
    isTemplate: true,
    search,
    page: 1,
    pageSize: 100
  });

  const {
    data: activeChecklists,
    isLoading: activeLoading,
    refreshChecklists: refreshActive,
  } = useChecklists({
    isTemplate: false,
    status: "active",
    search,
    page: 1,
    pageSize: 100
  });

  const {
    data: inactiveChecklists,
    isLoading: inactiveLoading,
    refreshChecklists: refreshInactive,
  } = useChecklists({
    isTemplate: false,
    status: "inactive",
    search,
    page: 1,
    pageSize: 100
  });

  const refreshAllChecklists = () => {
    refreshTemplates();
    refreshActive();
    refreshInactive();
  };

  const getActiveChecklists = (): ChecklistWithStats[] => {
    switch (activeTab) {
      case "template":
        return templates?.data || [];
      case "active":
        return activeChecklists?.data || [];
      case "inactive":
        return inactiveChecklists?.data || [];
      default:
        return [];
    }
  };

  const isLoading = templatesLoading || activeLoading || inactiveLoading;
  const displayedChecklists = getActiveChecklists();

  const checklistCounts = {
    template: templates?.data?.length || 0,
    active: activeChecklists?.data?.length || 0,
    inactive: inactiveChecklists?.data?.length || 0,
  };

  const handleDeleteChecklist = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      checklistId: id,
      checklistTitle: title,
    });
  };

  const handleDeleteConfirmed = async () => {
    try {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", deleteDialog.checklistId);

      if (error) {
        throw error;
      }

      toast.success("Checklist excluído com sucesso");
      refreshAllChecklists();
    } catch (error) {
      console.error("Error deleting checklist:", error);
      toast.error("Erro ao excluir checklist");
    } finally {
      setDeleteDialog({
        isOpen: false,
        checklistId: "",
        checklistTitle: "",
      });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .in("id", ids);

      if (error) {
        throw error;
      }

      toast.success(`${ids.length} checklists excluídos com sucesso`);
      refreshAllChecklists();
    } catch (error) {
      console.error("Error bulk deleting checklists:", error);
      toast.error("Erro ao excluir checklists em massa");
      throw error;
    }
  };

  const handleBulkStatusChange = async (ids: string[], newStatus: 'active' | 'inactive'): Promise<void> => {
    try {
      const { error } = await supabase
        .from("checklists")
        .update({ status: newStatus })
        .in("id", ids);

      if (error) {
        throw error;
      }

      refreshAllChecklists();
    } catch (error) {
      console.error(`Error changing status to ${newStatus}:`, error);
      throw error;
    }
  };

  const handleChecklistStatusChange = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from("checklists")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success(`Status do checklist alterado para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}`);
      refreshAllChecklists();
      return true;
    } catch (error) {
      console.error(`Error changing status to ${newStatus}:`, error);
      toast.error("Erro ao alterar status do checklist");
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Checklists</h1>
        </div>
        <Button onClick={() => navigate("/new-checklists")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Checklist
        </Button>
      </div>

      <Card className="overflow-visible">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Pesquisar checklists..."
              className="max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ChecklistTabs
            checklistCounts={checklistCounts}
            allChecklists={displayedChecklists}
            isLoading={isLoading}
            onEdit={(id) => navigate(`/new-checklists/${id}/edit`)}
            onDelete={(id) => handleDeleteChecklist(id, "")}
            onOpen={(id) => navigate(`/new-checklists/${id}`)}
            onStatusChange={refreshAllChecklists}
            onBulkDelete={handleBulkDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onTabChange={setActiveTab}
            activeTab={activeTab}
            onChecklistStatusChange={handleChecklistStatusChange}
          />
        </CardContent>
      </Card>
      
      <DeleteChecklistDialog
        checklistId={deleteDialog.checklistId}
        checklistTitle={deleteDialog.checklistTitle}
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}
        onDeleted={handleDeleteConfirmed}
      />
    </div>
  );
}
