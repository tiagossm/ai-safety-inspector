
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useStartInspection } from "@/hooks/inspection/useStartInspection";
import { FormProvider, useForm } from "react-hook-form";
import ChecklistHeaderSection from "./start-inspection/ChecklistHeaderSection";
import FormProgressSection from "./start-inspection/FormProgressSection";
import InspectionTabsSection from "./start-inspection/InspectionTabsSection";
import InspectionActionButtonsSection from "./start-inspection/InspectionActionButtonsSection";
import ShareDialogSection from "./start-inspection/ShareDialogSection";
import { handleError } from "@/utils/errorHandling";

export default function StartInspectionPage() {
  const navigate = useNavigate();
  const { checklistId } = useParams<{ checklistId: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [sharableLink, setSharableLink] = useState<string>("");
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugClickCount, setDebugClickCount] = useState<number>(0);
  const [hasStartedInspection, setHasStartedInspection] = useState<boolean>(false);
  
  const checklistQuery = useChecklistById(checklistId || "");
  
  const {
    formData,
    updateFormField,
    loading,
    submitting,
    formErrors,
    draftSaved,
    checklist: checklistData,
    checklistLoading,
    validateForm,
    startInspection,
    saveAsDraft,
    cancelAndGoBack,
    getCurrentLocation,
    getFormProgress,
    generateShareableLink,
  } = useStartInspection(checklistId);

  // Initialize React Hook Form with the data from useStartInspection
  const methods = useForm({
    defaultValues: formData
  });

  // Sync form data from useStartInspection to React Hook Form
  useEffect(() => {
    methods.reset(formData);
  }, [formData, methods]);

  const handleHeaderClick = () => {
    const newCount = debugClickCount + 1;
    setDebugClickCount(newCount);
    
    if (newCount >= 5) {
      setDebugMode(!debugMode);
      setDebugClickCount(0);
      toast.info(debugMode ? "Modo debug desativado" : "Modo debug ativado");
    }
  };

  const handleShare = async () => {
    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios antes de compartilhar");
      return;
    }

    setIsLoading(true);
    try {
      const inspectionId = await saveAsDraft();
      if (inspectionId && typeof inspectionId === 'string') {
        const link = generateShareableLink(inspectionId);
        setSharableLink(link);
        setShareDialogOpen(true);
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Inspeção compartilhada",
              text: `Inspeção ${checklistData?.title || ""} - Empresa: ${formData.companyData?.fantasy_name || ""}`,
              url: link
            });
          } catch (shareError) {
            console.log("Share API error or user canceled:", shareError);
            // This is not an error we need to show to the user
          }
        }
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      handleError(error, "Não foi possível gerar o link de compartilhamento");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharableLink).then(
      () => toast.success("Link copiado para a área de transferência"),
      () => toast.error("Não foi possível copiar o link")
    );
  };

  const handleStartInspection = async () => {
    // Prevent multiple inspections from being started
    if (hasStartedInspection) {
      console.log("Inspection already started, preventing duplicate submission");
      return false;
    }
    
    // Get current form data from React Hook Form
    const formValues = methods.getValues();
    
    // Update the formData in useStartInspection if needed
    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== formData[key]) {
        // Type-safe approach: Cast key to keyof typeof formData to ensure it's a valid key
        updateFormField(key as keyof typeof formData, formValues[key]);
      }
    });
    
    try {
      setHasStartedInspection(true); // Set flag to prevent multiple submissions
      const success = await startInspection();
      if (success) {
        toast.success("Inspeção iniciada com sucesso!");
      }
      return success;
    } catch (error) {
      setHasStartedInspection(false); // Reset flag on error
      handleError(error, "Não foi possível iniciar a inspeção");
      return false;
    }
  };

  const handleFormSubmit = methods.handleSubmit(async () => {
    if (hasStartedInspection) {
      console.log("Form already submitted, preventing duplicate submission");
      return;
    }
    await handleStartInspection();
  });

  if (checklistLoading || checklistQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-lg font-medium text-muted-foreground">Carregando dados do checklist...</p>
      </div>
    );
  }

  if (checklistQuery.error || !checklistQuery.data) {
    return (
      <div className="py-10 max-w-3xl mx-auto px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">Erro ao carregar checklist</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{checklistQuery.error?.message || "Não foi possível carregar os dados do checklist"}</p>
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/new-checklists")} className="text-sm">
                Voltar para Checklists
              </Button>
              <Button variant="default" onClick={() => window.location.reload()} className="text-sm">
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const checklist = checklistQuery.data;
  const formProgress = getFormProgress();

  return (
    <div className="container max-w-5xl py-8">
      <FormProvider {...methods}>
        <form onSubmit={handleFormSubmit}>
          <ChecklistHeaderSection
            checklist={checklist}
            draftSaved={draftSaved}
            debugMode={debugMode}
            debugClickCount={debugClickCount}
            handleHeaderClick={handleHeaderClick}
          />
          <FormProgressSection formProgress={formProgress} />
          <InspectionTabsSection
            formData={formData}
            updateFormField={(field: string, value: any) => {
              // Type-safe approach: Cast field to keyof typeof formData
              updateFormField(field as keyof typeof formData, value);
              // Use type assertion for methods.setValue too
              methods.setValue(field as keyof typeof formData, value);
            }}
            formErrors={formErrors}
            checklist={checklist}
            debugMode={debugMode}
            setDebugMode={setDebugMode}
            setDebugClickCount={setDebugClickCount}
          />
          <InspectionActionButtonsSection
            isLoading={isLoading}
            submitting={submitting}
            cancelAndGoBack={cancelAndGoBack}
            saveAsDraft={saveAsDraft}
            handleShare={handleShare}
            handleStartInspection={handleStartInspection}
          />
        </form>
      </FormProvider>
      <ShareDialogSection
        open={shareDialogOpen}
        setOpen={setShareDialogOpen}
        sharableLink={sharableLink}
        copyToClipboard={copyToClipboard}
        checklistData={checklistData}
        formData={formData}
      />
    </div>
  );
}
