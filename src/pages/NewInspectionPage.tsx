
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EnhancedInspectionForm } from "@/components/inspection/new/EnhancedInspectionForm";
import { useNewInspectionForm } from "@/hooks/inspection/useNewInspectionForm";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewInspectionPage() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();

  const {
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
    setCompanyData,
    setLocation,
    setNotes,
    setInspectionType,
    setPriority,
    setScheduledDate,
    handleCompanySelect,
    handleResponsibleSelect,
    handleSubmit,
    isFormValid
  } = useNewInspectionForm(checklistId);

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
      />
    </div>
  );
}
