
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistDetailHeader } from "@/components/new-checklist/ChecklistDetailHeader";
import { ChecklistDetailInfo } from "@/components/new-checklist/ChecklistDetailInfo";
import { ChecklistQuestions } from "@/components/new-checklist/ChecklistQuestions";
import { ChecklistDetailSkeleton } from "@/components/new-checklist/ChecklistDetailSkeleton";
import { ChecklistNotFound } from "@/components/new-checklist/ChecklistNotFound";

export default function NewChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: checklist, loading, refetch } = useChecklistById(id || "");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; checklistId: string; checklistTitle: string }>({
    isOpen: false,
    checklistId: "",
    checklistTitle: ""
  });

  const handleDelete = (checklistId: string, checklistTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      checklistId,
      checklistTitle
    });
  };

  const handleDeleteConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', deleteDialog.checklistId);
      
      if (error) throw error;
      
      toast.success('Checklist excluído com sucesso');
      window.location.href = '/checklists';
    } catch (error) {
      console.error('Error deleting checklist:', error);
      toast.error('Erro ao excluir checklist');
    } finally {
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  if (loading) {
    return <ChecklistDetailSkeleton />;
  }

  if (!checklist) {
    return <ChecklistNotFound />;
  }

  return (
    <div className="space-y-6">
      <ChecklistDetailHeader
        title={checklist.title}
        isTemplate={checklist.isTemplate}
        status={checklist.status}
        origin={checklist.origin}
        id={checklist.id}
        onDelete={handleDelete}
      />

      <ChecklistDetailInfo checklist={checklist} />

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Questões do Checklist</h2>
        <ChecklistQuestions 
          questions={checklist.questions || []}
          isEmpty={!checklist.questions || checklist.questions.length === 0}
        />
      </div>

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
