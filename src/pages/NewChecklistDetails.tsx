
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
    data: checklist,
    isLoading,
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

  if (isLoading) {
    return <ChecklistLoadingState />;
  }

  if (error) {
    return <ChecklistErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!checklist) {
    return <ChecklistErrorState error={new Error("Checklist não encontrado")} />;
  }

  // Now the checklist data should be properly formatted with the expected properties
  return (
    <div className="space-y-6">
      <ChecklistDetailsHeader 
        checklist={checklist} 
        onEdit={handleEditChecklist}
        onDelete={handleDeleteChecklist}
      />

      <ChecklistInfoCard checklist={checklist} />
      
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
    </div>
  );
}
