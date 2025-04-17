
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStartInspection, InspectionType, InspectionPriority } from "@/hooks/inspection/useStartInspection";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { LocationPicker } from "@/components/inspection/LocationPicker";
import { toast } from "sonner";
import { AlertTriangle, CalendarIcon, Check, ClipboardList, Download, Info, LoaderCircle, MapPin, QrCode, Save, Share2, User, Building } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function StartInspectionPage() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>("basic");
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [shareableLink, setShareableLink] = useState<string>("");
  
  const { 
    formData, 
    updateFormField,
    loading,
    submitting,
    formErrors,
    draftSaved,
    checklist,
    checklistLoading,
    validateForm,
    startInspection,
    saveAsDraft,
    cancelAndGoBack,
    getCurrentLocation,
    getFormProgress,
    fetchCompanyDetails,
    fetchResponsibleDetails
  } = useStartInspection(checklistId);
  
  // Função para salvar e compartilhar
  const handleSaveAndShare = async () => {
    const inspectionId = await saveAsDraft();
    if (inspectionId) {
      // Gerar link compartilhável
      const link = `${window.location.origin}/inspections/${inspectionId}/shared`;
      setShareableLink(link);
      setShareDialogOpen(true);
    }
  };

  // Copiar link para clipboard
  const copyShareableLink = () => {
    if (!shareableLink) return;
    
    try {
      navigator.clipboard.writeText(shareableLink);
      toast.success("Link copiado para a área de transferência");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Não foi possível copiar o link");
    }
  };

  // Ativar debugger com cliques rápidos no título
  const debugClickCounter = React.useRef<number>(0);
  const debugTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = () => {
    debugClickCounter.current++;
    
    if (debugTimerRef.current) clearTimeout(debugTimerRef.current);
    
    debugTimerRef.current = setTimeout(() => {
      if (debugClickCounter.current >= 5) {
        setShowDebug(prev => !prev);
        toast.info(showDebug ? "Modo debug desativado" : "Modo debug ativado");
      }
      debugClickCounter.current = 0;
    }, 500);
  };

  // Exibir QR Code do link
  const generateQRCodeUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
  };
  
  return (
    <div className="container max-w-5xl mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" onClick={handleTitleClick}>
            Iniciar Inspeção
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados necessários para iniciar uma nova inspeção
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {draftSaved && (
            <span className="text-xs text-muted-foreground">
              Salvo: {draftSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Detalhes da Inspeção
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo para configurar sua inspeção
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="advanced">Detalhes Adicionais</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6 pt-4">
                  {/* Empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      Empresa <span className="text-destructive ml-1">*</span>
                    </Label>
                    <CompanySelector
                      value={formData.companyId}
                      onSelect={(id, data) => {
                        updateFormField("companyId", id);
                        updateFormField("companyData", data);
                        
                        // Auto-preencher localização se estiver vazia
                        if (data?.address && !formData.location) {
                          updateFormField("location", data.address);
                        }
                      }}
                    />
                    {formErrors.company && (
                      <span className="text-sm text-destructive">{formErrors.company}</span>
                    )}
                  </div>
                  
                  {/* CNAE */}
                  {formData.companyData && (
                    <div className="space-y-2">
                      <Label htmlFor="cnae" className="flex items-center">
                        CNAE <span className="text-destructive ml-1">*</span>
                      </Label>
                      <div>
                        <Input
                          id="cnae"
                          value={formData.companyData.cnae || ""}
                          onChange={(e) => {
                            updateFormField("companyData", {
                              ...formData.companyData,
                              cnae: e.target.value
                            });
                          }}
                          placeholder="00.00-0"
                          className={formErrors.cnae ? "border-destructive" : ""}
                        />
                        {formErrors.cnae && (
                          <span className="text-sm text-destructive">{formErrors.cnae}</span>
                        )}
                        {formData.companyData.cnae && !/^\d{2}\.\d{2}-\d$/.test(formData.companyData.cnae) && (
                          <span className="text-sm text-amber-500 flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            O CNAE deve estar no formato 00.00-0
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Responsável */}
                  <div className="space-y-2">
                    <Label htmlFor="responsible" className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Responsável <span className="text-destructive ml-1">*</span>
                    </Label>
                    <ResponsibleSelector
                      value={formData.responsibleId}
                      onSelect={(id, data) => {
                        updateFormField("responsibleId", id);
                        updateFormField("responsibleData", data);
                      }}
                    />
                    {formErrors.responsible && (
                      <span className="text-sm text-destructive">{formErrors.responsible}</span>
                    )}
                  </div>
                  
                  {/* Localização */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Localização <span className="text-destructive ml-1">*</span>
                    </Label>
                    <LocationPicker
                      value={formData.location}
                      onChange={(value) => updateFormField("location", value)}
                      onCoordinatesChange={(coords) => updateFormField("coordinates", coords)}
                      coordinates={formData.coordinates}
                    />
                    {formErrors.location && (
                      <span className="text-sm text-destructive">{formErrors.location}</span>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-6 pt-4">
                  {/* Data Agendada */}
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date" className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Data Agendada
                    </Label>
                    <DateTimePicker
                      date={formData.scheduledDate}
                      setDate={(date) => updateFormField("scheduledDate", date)}
                    />
                  </div>
                  
                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateFormField("notes", e.target.value)}
                      placeholder="Informações adicionais sobre a inspeção"
                      rows={3}
                    />
                  </div>
                  
                  {/* Tipo de Inspeção e Prioridade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inspectionType">Tipo de Inspeção</Label>
                      <Select
                        value={formData.inspectionType}
                        onValueChange={(value) => updateFormField("inspectionType", value as InspectionType)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Interna</SelectItem>
                          <SelectItem value="external">Externa</SelectItem>
                          <SelectItem value="audit">Auditoria</SelectItem>
                          <SelectItem value="routine">Rotina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => updateFormField("priority", value as InspectionPriority)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low" className="text-green-600">Baixa</SelectItem>
                          <SelectItem value="medium" className="text-amber-600">Média</SelectItem>
                          <SelectItem value="high" className="text-red-600">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex-col space-y-4 items-stretch sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={cancelAndGoBack}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={saveAsDraft}
                  disabled={submitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveAndShare}
                  disabled={submitting}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                
                <Button
                  onClick={startInspection}
                  disabled={submitting || !validateForm()}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Iniciar Inspeção'
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Card do Progresso */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Progresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={getFormProgress()} className="h-2" />
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  {formData.companyId ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 mr-1 rounded-full border border-gray-300" />
                  )}
                  <span>Empresa</span>
                </div>
                
                <div className="flex items-center">
                  {formData.companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(formData.companyData.cnae) ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 mr-1 rounded-full border border-gray-300" />
                  )}
                  <span>CNAE</span>
                </div>
                
                <div className="flex items-center">
                  {formData.responsibleId ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 mr-1 rounded-full border border-gray-300" />
                  )}
                  <span>Responsável</span>
                </div>
                
                <div className="flex items-center">
                  {formData.location || formData.coordinates ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 mr-1 rounded-full border border-gray-300" />
                  )}
                  <span>Localização</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Informações do Checklist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Detalhes do Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              {checklistLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : checklist ? (
                <div className="space-y-2">
                  <div className="font-medium">{checklist.title}</div>
                  {checklist.description && (
                    <div className="text-sm text-muted-foreground">
                      {checklist.description}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Checklist não encontrado ou não selecionado
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Card de Dicas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Dicas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• A localização pode ser inserida manualmente ou captada via GPS</p>
              <p>• O CNAE deve seguir o formato XX.XX-X</p>
              <p>• Salve como rascunho para continuar depois</p>
              <p>• Preencha todos os campos obrigatórios para iniciar</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Debug Info */}
      {showDebug && (
        <Card className="border-dashed border-yellow-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto max-h-[300px]">
            <pre className="text-xs">{JSON.stringify(formData, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
      
      {/* Dialog de Compartilhamento */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Inspeção</DialogTitle>
            <DialogDescription>
              Compartilhe esta inspeção com outras pessoas via link ou QR Code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              {shareableLink && (
                <div className="border rounded-lg p-2">
                  <img 
                    src={generateQRCodeUrl(shareableLink)} 
                    alt="QR Code para compartilhamento"
                    className="w-32 h-32 mx-auto" 
                  />
                </div>
              )}
              
              <div className="w-full">
                <Label htmlFor="shareLink">Link para compartilhamento</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="shareLink"
                    value={shareableLink}
                    readOnly
                    className="flex-grow"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={copyShareableLink}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Copiar Link</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copiar Link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Este link permite acesso à inspeção compartilhada. Compartilhe apenas com pessoas autorizadas.
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(false)}
            >
              Fechar
            </Button>
            
            {navigator.share && (
              <Button
                onClick={() => {
                  navigator.share({
                    title: 'Compartilhar Inspeção',
                    text: 'Acesse a inspeção compartilhada',
                    url: shareableLink
                  })
                  .catch(err => console.error('Error sharing:', err));
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
