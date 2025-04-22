
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

export default function StartInspectionPage() {
  const navigate = useNavigate();
  const { checklistId } = useParams<{ checklistId: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [sharableLink, setSharableLink] = useState<string>("");
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugClickCount, setDebugClickCount] = useState<number>(0);
  
  // Buscar dados do checklist
  const checklistQuery = useChecklistById(checklistId || "");
  
  // Custom hook para gerenciar o formulário de iniciar inspeção
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

  // Ativar modo de debug após 5 cliques no título
  const handleHeaderClick = () => {
    const newCount = debugClickCount + 1;
    setDebugClickCount(newCount);
    
    if (newCount >= 5) {
      setDebugMode(!debugMode);
      setDebugClickCount(0);
      toast.info(debugMode ? "Modo debug desativado" : "Modo debug ativado");
    }
  };

  // Gerar link compartilhável
  const handleShare = async () => {
    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios antes de compartilhar");
      return;
    }

    setIsLoading(true);
    try {
      const inspectionId = await saveAsDraft();
      if (inspectionId) {
        const link = generateShareableLink(inspectionId as string);
        setSharableLink(link);
        setShareDialogOpen(true);
        
        // Tentar usar a API de compartilhamento nativa
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

  // Copiar link para a área de transferência
  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharableLink).then(
      () => toast.success("Link copiado para a área de transferência"),
      () => toast.error("Não foi possível copiar o link")
    );
  };

  // Iniciar a inspeção
  const handleStartInspection = async () => {
    const success = await startInspection();
    if (success) {
      toast.success("Inspeção iniciada com sucesso!");
    }
  };

  // Exibindo mensagem de carregamento enquanto os dados são buscados
  if (checklistLoading || checklistQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-lg font-medium text-muted-foreground">Carregando dados do checklist...</p>
      </div>
    );
  }

  // Exibindo mensagem de erro caso ocorra algum problema ao buscar os dados
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 
            className="text-2xl font-bold tracking-tight cursor-pointer" 
            onClick={handleHeaderClick}
          >
            Iniciar Inspeção
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados necessários para iniciar a inspeção
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {draftSaved && (
            <Badge variant="outline" className="text-xs">
              <Check className="w-3 h-3 mr-1" /> 
              Salvo {draftSaved.toLocaleTimeString()}
            </Badge>
          )}
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            {checklist.isTemplate ? "Template" : "Checklist"}
          </Badge>
        </div>
      </div>

      {/* Card com informações do checklist */}
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

      {/* Barra de progresso do formulário */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium">Progresso do formulário</p>
          <Badge variant="outline">{formProgress}%</Badge>
        </div>
        <Progress value={formProgress} className="h-2" />
      </div>

      {/* Formulário de configuração da inspeção */}
      <div className="bg-card p-6 rounded-lg border border-border mb-6">
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="advanced">Configurações</TabsTrigger>
            {debugMode && <TabsTrigger value="debug">Debug</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="basic">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seletor de Empresa */}
              <div className="space-y-2">
                <FormLabel htmlFor="company" className={formErrors.company ? "text-destructive" : ""}>
                  Empresa <span className="text-destructive">*</span>
                </FormLabel>
                <CompanySelector
                  value={formData.companyId}
                  onSelect={(id, data) => {
                    updateFormField("companyId", id);
                    updateFormField("companyData", data);
                  }}
                  className={formErrors.company ? "border-destructive" : ""}
                />
                {formErrors.company && (
                  <p className="text-sm text-destructive">{formErrors.company}</p>
                )}
              </div>
              
              {/* CNAE */}
              <div className="space-y-2">
                <FormLabel htmlFor="cnae" className={formErrors.cnae ? "text-destructive" : ""}>
                  CNAE
                </FormLabel>
                <div className="relative">
                  <Input
                    id="cnae"
                    placeholder="00.00-0"
                    value={formData.companyData?.cnae || ""}
                    onChange={(e) => {
                      const newData = { ...formData.companyData, cnae: e.target.value };
                      updateFormField("companyData", newData);
                    }}
                    className={formErrors.cnae ? "border-destructive" : ""}
                  />
                  {formData.companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(formData.companyData.cnae) && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
                {formErrors.cnae && (
                  <p className="text-sm text-destructive">{formErrors.cnae}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: XX.XX-X (ex: 42.11-1)
                </p>
              </div>

              {/* Responsável */}
              <div className="space-y-2">
                <FormLabel htmlFor="responsible" className={formErrors.responsible ? "text-destructive" : ""}>
                  Responsável <span className="text-destructive">*</span>
                </FormLabel>
                <ResponsibleSelector
                  value={formData.responsibleId}
                  onSelect={(id, data) => {
                    updateFormField("responsibleId", id);
                    updateFormField("responsibleData", data);
                  }}
                  className={formErrors.responsible ? "border-destructive" : ""}
                />
                {formErrors.responsible && (
                  <p className="text-sm text-destructive">{formErrors.responsible}</p>
                )}
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <FormLabel htmlFor="location" className={formErrors.location ? "text-destructive" : ""}>
                  Localização <span className="text-destructive">*</span>
                </FormLabel>
                <LocationPicker
                  value={formData.location}
                  onChange={(value) => updateFormField("location", value)}
                  onCoordinatesChange={(coords) => updateFormField("coordinates", coords)}
                  coordinates={formData.coordinates}
                />
                {formErrors.location && (
                  <p className="text-sm text-destructive">{formErrors.location}</p>
                )}
              </div>

              {/* Data Agendada */}
              <div className="space-y-2">
                <FormLabel htmlFor="scheduledDate">
                  Data Agendada
                </FormLabel>
                <DateTimePicker
                  date={formData.scheduledDate}
                  setDate={(date) => updateFormField("scheduledDate", date)}
                />
              </div>

              {/* Observações */}
              <div className="space-y-2 md:col-span-2">
                <FormLabel htmlFor="notes">
                  Observações
                </FormLabel>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações relevantes para a inspeção"
                  value={formData.notes}
                  onChange={(e) => updateFormField("notes", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Inspeção */}
              <div className="space-y-4">
                <FormLabel>
                  Tipo de Inspeção
                </FormLabel>
                <RadioGroup
                  defaultValue={formData.inspectionType}
                  onValueChange={(value) => updateFormField("inspectionType", value as any)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="internal" id="internal" className="peer sr-only" />
                    <FormLabel
                      htmlFor="internal"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Interna</span>
                    </FormLabel>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="external" id="external" className="peer sr-only" />
                    <FormLabel
                      htmlFor="external"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Externa</span>
                    </FormLabel>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="audit" id="audit" className="peer sr-only" />
                    <FormLabel
                      htmlFor="audit"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Auditoria</span>
                    </FormLabel>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="routine" id="routine" className="peer sr-only" />
                    <FormLabel
                      htmlFor="routine"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Rotina</span>
                    </FormLabel>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Prioridade */}
              <div className="space-y-4">
                <FormLabel>
                  Prioridade
                </FormLabel>
                <RadioGroup
                  defaultValue={formData.priority}
                  onValueChange={(value) => updateFormField("priority", value as any)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem value="low" id="low" className="peer sr-only" />
                    <FormLabel
                      htmlFor="low"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Baixa</span>
                    </FormLabel>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
                    <FormLabel
                      htmlFor="medium"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Média</span>
                    </FormLabel>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="high" id="high" className="peer sr-only" />
                    <FormLabel
                      htmlFor="high"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Alta</span>
                    </FormLabel>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          
          {/* Modo Debug */}
          {debugMode && (
            <TabsContent value="debug">
              <div className="p-4 bg-black text-green-400 font-mono rounded-md overflow-auto max-h-[400px]">
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6">
        <Button 
          variant="outline" 
          onClick={cancelAndGoBack}
          disabled={isLoading || submitting}
        >
          Cancelar
        </Button>
        
        <Button 
          variant="outline" 
          onClick={saveAsDraft}
          disabled={isLoading || submitting}
        >
          {submitting === 'draft' ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
              Salvando...
            </>
          ) : (
            'Salvar como Rascunho'
          )}
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleShare}
          disabled={isLoading || submitting}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
        
        <Button 
          onClick={handleStartInspection}
          disabled={isLoading || submitting}
        >
          {submitting === 'pending' ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
              Iniciando...
            </>
          ) : (
            <>
              Iniciar Inspeção
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      {/* Modal para compartilhar inspeção */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Inspeção</DialogTitle>
            <DialogDescription>
              Compartilhe esta inspeção com outros responsáveis ou envie o link para dispositivos móveis.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                value={sharableLink}
                readOnly
                className="w-full"
              />
            </div>
            <Button size="sm" variant="secondary" className="px-3" onClick={copyToClipboard}>
              <span className="sr-only">Copiar</span>
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center p-4">
            {/* Aqui você pode adicionar o QR Code usando uma biblioteca como qrcode.react */}
            <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
              <Info className="h-8 w-8 text-gray-400" />
              <span className="sr-only">QR Code</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="secondary" onClick={() => setShareDialogOpen(false)}>
              Fechar
            </Button>
            {navigator.share && (
              <Button
                variant="default"
                onClick={() => {
                  navigator.share({
                    title: "Inspeção compartilhada",
                    text: `Inspeção ${checklistData?.title || ""} - Empresa: ${formData.companyData?.fantasy_name || ""}`,
                    url: sharableLink
                  }).catch(err => console.error("Erro ao compartilhar:", err));
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
