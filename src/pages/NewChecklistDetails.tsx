
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { ChecklistDetailsHeader } from "@/components/new-checklist/details/ChecklistDetailsHeader";
import { ChecklistInfoCard } from "@/components/new-checklist/details/ChecklistInfoCard";
import { ChecklistQuestionsTable } from "@/components/new-checklist/details/ChecklistQuestionsTable";
import { ChecklistLoadingState } from "@/components/new-checklist/details/ChecklistLoadingState";
import { ChecklistErrorState } from "@/components/new-checklist/details/ChecklistErrorState";
import { GlobalFloatingActionButton } from "@/components/inspection/GlobalFloatingActionButton";
import { ChecklistWithStats } from "@/types/newChecklist";

export default function NewChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklistToDelete, setChecklistToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const {
    checklist,
    loading,
    error,
    refetch
  } = useChecklistById(id as string);

  const handleEditChecklist = (id: string) => {
    navigate(`/new-checklists/${id}/edit`);
  };

  const handleDeleteChecklist = async (id: string, title: string) => {
    setChecklistToDelete({ id, title });
  };

  const confirmDeleteChecklist = async () => {
    if (!checklistToDelete) return;

    setIsDeleting(true);
    try {
      // Simulate delete operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Checklist excluído com sucesso!",
        description: `O checklist "${checklistToDelete.title}" foi excluído.`,
      });
      navigate("/new-checklists");
    } finally {
      setIsDeleting(false);
      setChecklistToDelete(null);
    }
  };

  if (loading) {
    return <ChecklistLoadingState />;
  }

  if (error) {
    return <ChecklistErrorState 
      error={new Error(typeof error === 'string' ? error : 'Erro desconhecido')} 
      onRetry={() => refetch()} 
    />;
  }

  if (!checklist) {
    return <ChecklistErrorState error={new Error("Checklist não encontrado")} />;
  }

  // Convert ChecklistWithQuestions to ChecklistWithStats
  const checklistWithStats: ChecklistWithStats = {
    ...checklist,
    status: checklist.status || "ativo",
    totalQuestions: checklist.questions?.length || 0,
    completedQuestions: 0,
    companyName: "",
    responsibleName: "",
    createdByName: "",
    isSubChecklist: false,
    origin: "manual"
  };

  return (
    <div className="space-y-6">
      <ChecklistDetailsHeader 
        checklist={checklistWithStats} 
        onEdit={handleEditChecklist}
        onDelete={handleDeleteChecklist}
      />

      <ChecklistInfoCard checklist={checklistWithStats} />
      
      <ChecklistQuestionsTable questions={checklist.questions || []} />

      <DeleteChecklistDialog
        checklistId={checklistToDelete?.id || ""}
        checklistTitle={checklistToDelete?.title || ""}
        isOpen={!!checklistToDelete}
        onOpenChange={(open: boolean) =>
          open ? null : setChecklistToDelete(null)
        }
        onDeleted={confirmDeleteChecklist}
        isDeleting={isDeleting}
      />
      
      <GlobalFloatingActionButton />
    </div>
  );
}
