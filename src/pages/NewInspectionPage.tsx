
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EnhancedInspectionForm } from "@/components/inspection/new/EnhancedInspectionForm";
import { useEnhancedInspectionForm } from "@/hooks/inspection/useEnhancedInspectionForm";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewInspectionPage() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const [hasDraft, setHasDraft] = useState(false);

  const {
    // State
    checklist,
    loading,
    submitting,
    companyId,
    companyData,
    responsibleId,
    scheduledDate,
    location,
    notes,
    inspectionType,
    priority,
    errors,
    activeTab,
    draftSaved,
    recentCompanies,
    recentLocations,
    
    // Setters
    setCompanyData,
    setLocation,
    setNotes,
    setInspectionType,
    setPriority,
    setScheduledDate,
    
    // Handlers
    handleCompanySelect,
    handleResponsibleSelect,
    handleSubmit,
    loadDraft,
    isFormValid
  } = useEnhancedInspectionForm(checklistId);

  // Check for draft on initial load
  useEffect(() => {
    const draftKey = `inspection_draft_${checklistId || "new"}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      setHasDraft(true);
    }
  }, [checklistId]);

  // Handler for draft loading
  const handleLoadDraft = () => {
    if (loadDraft()) {
      setHasDraft(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate("/inspections");
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-2 pl-0" 
          onClick={() => navigate("/inspections")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Inspeções
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Nova Inspeção</h1>
            <p className="text-muted-foreground">
              {checklist?.title ? `Baseado em: ${checklist.title}` : "Preencha os dados para iniciar"}
            </p>
          </div>
          
          {hasDraft && (
            <Button 
              variant="outline" 
              onClick={handleLoadDraft}
              className="mt-4 md:mt-0"
            >
              Carregar Rascunho Salvo
            </Button>
          )}
        </div>
      </div>
      
      {/* Form */}
      <EnhancedInspectionForm
        loading={loading}
        submitting={submitting}
        companyId={companyId}
        companyData={companyData}
        setCompanyData={setCompanyData}
        responsibleId={responsibleId}
        location={location}
        setLocation={setLocation}
        notes={notes}
        setNotes={setNotes}
        inspectionType={inspectionType}
        setInspectionType={setInspectionType}
        priority={priority}
        setPriority={setPriority}
        scheduledDate={scheduledDate}
        setScheduledDate={setScheduledDate}
        errors={errors}
        handleCompanySelect={handleCompanySelect}
        handleResponsibleSelect={handleResponsibleSelect}
        handleSubmit={handleSubmit}
        isFormValid={isFormValid}
        onCancel={handleCancel}
        recentCompanies={recentCompanies}
        recentLocations={recentLocations}
      />
    </div>
  );
}
