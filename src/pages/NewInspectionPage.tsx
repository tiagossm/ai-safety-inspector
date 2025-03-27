
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNewInspectionForm } from "@/hooks/inspection/useNewInspectionForm";
import { ChecklistInfoCard } from "@/components/inspection/new/ChecklistInfoCard";
import { InspectionDetailsForm } from "@/components/inspection/new/InspectionDetailsForm";

const NewInspectionPage = () => {
  const { id: checklistId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    checklist,
    loading,
    submitting,
    companyId,
    companyData,
    responsibleId,
    responsibleData,
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
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/inspections")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Nova Inspeção</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Checklist info */}
          <div className="md:col-span-1">
            <ChecklistInfoCard
              loading={loading}
              checklist={checklist}
              checklistId={checklistId}
            />
          </div>
          
          {/* Right column - Form fields */}
          <div className="md:col-span-2">
            <InspectionDetailsForm
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
              onCancel={() => navigate("/inspections")}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewInspectionPage;
