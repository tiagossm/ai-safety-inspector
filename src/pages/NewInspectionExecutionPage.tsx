
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { EnhancedInspectionForm } from "@/components/inspection/new/EnhancedInspectionForm";

export default function NewInspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true); // Default to expanded for new inspections
  const [editMode, setEditMode] = useState(true); // Default to edit mode for new inspections
  const [viewMode, setViewMode] = useState<"read" | "edit">("edit");
  
  // Sample recent companies and locations for demonstration
  const recentCompanies = [
    { id: "recent-1", fantasy_name: "Empresa ABC", cnae: "41.20-4" },
    { id: "recent-2", fantasy_name: "Empresa XYZ", cnae: "42.13-8" }
  ];
  
  const recentLocations = [
    { address: "Av. Paulista, 1000 - São Paulo, SP" },
    { address: "Rua Augusta, 500 - São Paulo, SP" }
  ];

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

  // Check if this is a new or incomplete inspection
  const isNewOrIncompleteInspection = !inspection?.id || (!company?.id || !responsible?.id);

  // When mounting, if this is a new inspection, expand the panel and set edit mode
  useEffect(() => {
    if (isNewOrIncompleteInspection) {
      setIsPanelExpanded(true);
      setEditMode(true);
    }
  }, [isNewOrIncompleteInspection]);

  // Check if the current user is offline
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

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
      refreshData(); // Refresh data after saving
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

  // Toggle view mode between read and edit
  const toggleViewMode = () => {
    setViewMode(prev => prev === "read" ? "edit" : "read");
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

  // Check if this is a shared view (simplified interface)
  const isSharedView = window.location.pathname.includes('/share/');

  // If we need to show the form for a new or incomplete inspection
  if (isNewOrIncompleteInspection) {
    // Use a hook for form data
    const { 
      companyId = "",
      companyData = null,
      responsibleId = "",
      scheduledDate = undefined,
      location = "",
      notes = "",
      inspectionType = "internal",
      priority = "medium"
    } = inspection || {};

    const handleCompanySelect = (id: string, data: any) => {
      // Handle company selection logic here
      console.log("Selected company:", id, data);
      refreshData(); // Refresh data after selection
    };

    const handleResponsibleSelect = (id: string, data: any) => {
      // Handle responsible selection logic here
      console.log("Selected responsible:", id, data);
      refreshData(); // Refresh data after selection
    };

    return (
      <TooltipProvider>
        <div className="container max-w-7xl mx-auto py-6">
          <EnhancedInspectionForm
            loading={loading}
            submitting={savingResponses}
            companyId={company?.id || ""}
            companyData={company}
            setCompanyData={(data) => console.log("Updated company data:", data)}
            responsibleId={responsible?.id || ""}
            location={location}
            setLocation={(value) => console.log("Updated location:", value)}
            notes={notes}
            setNotes={(value) => console.log("Updated notes:", value)}
            inspectionType={inspectionType}
            setInspectionType={(value) => console.log("Updated inspection type:", value)}
            priority={priority}
            setPriority={(value) => console.log("Updated priority:", value)}
            scheduledDate={scheduledDate ? new Date(scheduledDate) : undefined}
            setScheduledDate={(date) => console.log("Updated scheduled date:", date)}
            errors={{}}
            handleCompanySelect={handleCompanySelect}
            handleResponsibleSelect={handleResponsibleSelect}
            handleSubmit={handleSaveProgress}
            isFormValid={() => true}
            onCancel={() => navigate("/inspections")}
            recentCompanies={recentCompanies}
            recentLocations={recentLocations}
          />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="container max-w-7xl mx-auto py-4 pb-24 relative">
        {isOffline && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 mb-4 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium">Modo Offline</span>
              <span className="ml-2 text-sm">Suas alterações serão salvas localmente e sincronizadas quando estiver online.</span>
            </div>
          </div>
        )}
        
        {/* Header with progress */}
        <InspectionHeader 
          title={inspection.title || "Inspeção sem título"}
          description={inspection.description || ""}
          status={inspection.status}
          stats={stats}
          viewMode={viewMode}
          onToggleViewMode={isInspectionEditable && !isSharedView ? toggleViewMode : undefined}
        />

        {/* Expandable Panel for Inspection Data */}
        {!isSharedView && (
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
            isEditable={isInspectionEditable && viewMode === "edit"}
          />
        )}

        {/* Questions Panel - Only show if company and responsible are set */}
        {(company?.id && responsible?.id) ? (
          <QuestionsPanel
            questions={questions}
            groups={groups}
            responses={responses}
            onResponseChange={handleResponseChange}
            onMediaChange={handleMediaChange}
            onMediaUpload={handleMediaUpload}
            isEditable={isInspectionEditable && viewMode === "edit"}
          />
        ) : (
          <Card className="p-6 text-center">
            <div className="mb-4 text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium">Dados obrigatórios pendentes</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Por favor, preencha os dados da empresa e responsável para continuar com a inspeção.
            </p>
            <ul className="list-disc text-left mx-auto w-fit mb-4">
              <li className="text-red-600">Empresa</li>
              <li className="text-red-600">Responsável</li>
            </ul>
            <Button onClick={handleEditData}>
              Preencher Dados
            </Button>
          </Card>
        )}
        
        {/* Floating Action Menu - only show in non-shared view */}
        {!isSharedView && (
          <FloatingActionMenu
            onSaveProgress={handleSaveProgress}
            onCompleteInspection={handleCompleteInspection}
            onEditData={isNewOrIncompleteInspection ? handleEditData : undefined}
            onShare={handleShare}
            onDelete={handleDelete}
            isEditable={isInspectionEditable}
            isSaving={savingResponses}
            isCompleted={inspection.status === "Concluída"}
            onReopenInspection={() => reopenInspection(inspection)}
          />
        )}
        
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
    </TooltipProvider>
  );
}
