
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InspectionHeader } from "@/components/inspection/execution/InspectionHeader";
import { InspectionExpandablePanel } from "@/components/inspection/execution/InspectionExpandablePanel";
import { QuestionsPanel } from "@/components/inspection/execution/QuestionsPanel";
import { FloatingActionMenu } from "@/components/inspection/execution/FloatingActionMenu";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { ShareInspectionDialog } from "@/components/inspection/execution/ShareInspectionDialog";
import { DeleteInspectionDialog } from "@/components/inspection/execution/DeleteInspectionDialog";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewInspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Use the inspection data hook to fetch all necessary data
  const {
    loading,
    error,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    responsibles,
    refreshData,
    handleResponseChange,
    handleMediaUpload,
    handleMediaChange,
    handleSaveInspection,
    completeInspection,
    reopenInspection,
    savingResponses
  } = useInspectionData(id);

  // Calculate completion stats
  const calculateCompletionStats = () => {
    if (!questions || questions.length === 0) return { percentage: 0, answered: 0, total: 0 };
    
    const total = questions.length;
    const answered = Object.keys(responses || {}).filter(id => 
      responses[id] && responses[id].value !== undefined && responses[id].value !== null
    ).length;
    
    return {
      percentage: Math.round((answered / total) * 100),
      answered,
      total
    };
  };

  const stats = calculateCompletionStats();

  // Handle the share button click
  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  // Handle the delete button click
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  // Handle inspection completion
  const handleCompleteInspection = async () => {
    try {
      // First save progress
      await handleSaveInspection();
      
      // Then complete the inspection
      await completeInspection(inspection);
      toast.success("Inspeção finalizada com sucesso!");
      refreshData();
    } catch (error) {
      console.error("Error completing inspection:", error);
      toast.error("Erro ao finalizar inspeção. Tente novamente.");
    }
  };

  // Handle save progress
  const handleSaveProgress = async () => {
    try {
      await handleSaveInspection();
      toast.success("Progresso salvo com sucesso!");
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Erro ao salvar progresso. Tente novamente.");
    }
  };

  // Handle edit inspection data
  const handleEditData = () => {
    setIsPanelExpanded(true);
    setEditMode(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Carregando inspeção...</p>
      </div>
    );
  }

  // Show error state
  if (error || !inspection) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar inspeção</h2>
            <p className="mb-6 text-muted-foreground">{error || "Inspeção não encontrada"}</p>
            <Button onClick={() => navigate("/inspections")} variant="default">
              Voltar para Inspeções
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isInspectionEditable = ["Pendente", "Em Andamento"].includes(inspection.status);

  return (
    <div className="container max-w-7xl mx-auto py-4 pb-24 relative">
      {/* Header with progress */}
      <InspectionHeader 
        title={inspection.title || "Inspeção sem título"}
        description={inspection.description || ""}
        status={inspection.status}
        stats={stats}
      />

      {/* Expandable Panel for Inspection Data */}
      <InspectionExpandablePanel
        inspection={inspection}
        company={company}
        responsible={responsible}
        responsibles={responsibles || []}
        isExpanded={isPanelExpanded}
        onToggleExpand={() => setIsPanelExpanded(!isPanelExpanded)}
        editMode={editMode}
        setEditMode={setEditMode}
        onSave={refreshData}
        isEditable={isInspectionEditable}
      />

      {/* Questions Panel */}
      <QuestionsPanel
        questions={questions}
        groups={groups}
        responses={responses}
        onResponseChange={handleResponseChange}
        onMediaChange={handleMediaChange}
        onMediaUpload={handleMediaUpload}
        isEditable={isInspectionEditable}
      />
      
      {/* Floating Action Menu */}
      <FloatingActionMenu
        onSaveProgress={handleSaveProgress}
        onCompleteInspection={handleCompleteInspection}
        onEditData={handleEditData}
        onShare={handleShare}
        onDelete={handleDelete}
        isEditable={isInspectionEditable}
        isSaving={savingResponses}
        isCompleted={inspection.status === "Concluída"}
        onReopenInspection={() => reopenInspection(inspection)}
      />
      
      {/* Share Dialog */}
      <ShareInspectionDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        inspectionId={id || ""}
      />
      
      {/* Delete Dialog */}
      <DeleteInspectionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inspectionId={id || ""}
        inspectionTitle={inspection.title || ""}
        onDeleted={() => navigate("/inspections")}
      />
    </div>
  );
}
