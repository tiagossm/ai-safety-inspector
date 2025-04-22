import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, ChevronRight, ClipboardCopy, Info, Pencil, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { LocationPicker } from "@/components/inspection/LocationPicker";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { useStartInspection } from "@/hooks/inspection/useStartInspection";
import ChecklistHeaderSection from "./start-inspection/ChecklistHeaderSection";
import FormProgressSection from "./start-inspection/FormProgressSection";
import InspectionTabsSection from "./start-inspection/InspectionTabsSection";
import InspectionActionButtonsSection from "./start-inspection/InspectionActionButtonsSection";
import ShareDialogSection from "./start-inspection/ShareDialogSection";

export default function StartInspectionPage() {
  const navigate = useNavigate();
  const { checklistId } = useParams<{ checklistId: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [sharableLink, setSharableLink] = useState<string>("");
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugClickCount, setDebugClickCount] = useState<number>(0);
  
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
          await navigator.share({
            title: "Inspeção compartilhada",
            text: `Inspeção ${checklistData?.title || ""} - Empresa: ${formData.companyData?.fantasy_name || ""}`,
            url: link
          });
        }
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast.error("Não foi possível gerar o link de compartilhamento");
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
    const success = await startInspection();
    if (success) {
      toast.success("Inspeção iniciada com sucesso!");
    }
  };

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
                <RefreshCw className="mr-2 h-4 w-4" />
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
      <ChecklistHeaderSection
        checklist={checklist}
        draftSaved={draftSaved}
        debugMode={debugMode}
        debugClickCount={debugClickCount}
        handleHeaderClick={handleHeaderClick}
      />
      <Card className="mb-6 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between">
            <span>{checklist.title}</span>
            <Badge variant={checklist.status === "active" ? "default" : "outline"}>
              {checklist.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </CardTitle>
          {checklist.description && (
            <CardDescription>{checklist.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Total de perguntas</p>
              <p className="text-2xl font-bold">{checklist.totalQuestions || "0"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Categoria</p>
              <p>{checklist.category || "Não definida"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <FormProgressSection formProgress={formProgress} />
      <InspectionTabsSection
        formData={formData}
        updateFormField={updateFormField}
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
