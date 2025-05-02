
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress"; 
import { ChevronDown, ChevronUp, Save, QrCode, Share, FileText, Edit, Check, X } from "lucide-react";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { LocationPicker } from "@/components/inspection/LocationPicker";
import { cn } from "@/lib/utils";
import { 
  useInspectionHeaderForm, 
  InspectionFormValues, 
  InspectionHeaderFormProps 
} from "@/hooks/inspection/useInspectionHeaderForm";
import { QRCodeGenerator } from "@/components/inspection/sharing/QRCodeGenerator";
import { ShareLinkGenerator } from "@/components/inspection/sharing/ShareLinkGenerator";
import { EnhancedCompanySelector } from "@/components/selection/EnhancedCompanySelector";
import { EnhancedResponsibleSelector } from "@/components/selection/EnhancedResponsibleSelector";
import { TooltipProvider } from "@/components/ui/tooltip";

// Define interface for company and responsible selector options
interface SelectOption {
  label: string;
  value: string;
}

const coordinatesSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional()
}).nullable().optional();

const inspectionFormSchema = z.object({
  companyId: z.string().uuid({ message: "Selecione uma empresa válida" }),
  responsibleIds: z.array(z.string()).min(1, "Selecione pelo menos um responsável"),
  scheduledDate: z.date().optional().nullable(),
  location: z.string().min(1, "Localização é obrigatória"),
  inspectionType: z.string().min(1, "Tipo de inspeção é obrigatório"),
  priority: z.string().default("medium"),
  notes: z.string().optional(),
  coordinates: coordinatesSchema
});

export function InspectionHeaderForm({
  inspectionId,
  inspection,
  company,
  responsible,
  isEditable = true,
  onSave,
}: InspectionHeaderFormProps) {
  const [expanded, setExpanded] = useState(true);
  const [showHistoryLog, setShowHistoryLog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { updateInspectionData, validateRequiredFields, saveAsDraft, updating } = useInspectionHeaderForm(inspectionId);
  const [progress, setProgress] = useState(0);
  const [companyError, setCompanyError] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState(company);
  const [selectedResponsibles, setSelectedResponsibles] = useState(
    responsible ? [responsible] : []
  );
  
  const processCoordinates = (coords: any) => {
    if (!coords) return null;
    
    if (typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
      return {
        latitude: coords.latitude,
        longitude: coords.longitude
      };
    }
    return null;
  };

  const initialResponsibleIds = responsible?.id ? [responsible.id] : [];

  const defaultValues: Partial<InspectionFormValues> = {
    companyId: company?.id || "",
    responsibleIds: initialResponsibleIds,
    scheduledDate: inspection?.scheduled_date ? new Date(inspection.scheduled_date) : null,
    location: inspection?.location || "",
    notes: inspection?.metadata?.notes || "",
    inspectionType: inspection?.inspection_type || "",
    priority: inspection?.priority || "medium",
    coordinates: processCoordinates(inspection?.metadata?.coordinates)
  };

  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues,
  });

  const calculateProgress = (data: Partial<InspectionFormValues>) => {
    const requiredFields = ['companyId', 'responsibleIds', 'location', 'inspectionType'];
    let filledCount = 0;
    
    if (data.companyId) filledCount++;
    if (data.responsibleIds && data.responsibleIds.length > 0) filledCount++;
    if (data.location) filledCount++;
    if (data.inspectionType) filledCount++;
    
    return (filledCount / requiredFields.length) * 100;
  };

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setProgress(calculateProgress(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: InspectionFormValues) => {
    try {
      if (data.coordinates && (
          typeof data.coordinates.latitude !== 'number' ||
          typeof data.coordinates.longitude !== 'number'
      )) {
        data.coordinates = null;
      }
      
      await updateInspectionData(data);
      setIsEditing(false);
      onSave();
    } catch (error) {
      // Error handling is managed by the hook
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      const formData = form.getValues();
      
      if (formData.coordinates && (
          typeof formData.coordinates.latitude !== 'number' ||
          typeof formData.coordinates.longitude !== 'number'
      )) {
        formData.coordinates = null;
      }
      
      await saveAsDraft(formData);
    } catch (error) {
      // Error handling is managed by the hook
    }
  };

  const handleShowLogs = () => {
    setShowHistoryLog(!showHistoryLog);
  };

  const getInspectionTypeIcon = (type: string) => {
    switch (type) {
      case "internal":
        return "🏢"; // Internal
      case "external":
        return "🌐"; // External
      case "audit":
        return "📋"; // Audit
      case "routine":
        return "🔄"; // Routine
      default:
        return "❓"; // Unknown
    }
  };

  return (
    <TooltipProvider>
      <Card className="mb-6">
        <CardHeader 
          className={cn(
            "flex flex-row items-center justify-between space-y-0",
            !expanded && "pb-3"
          )}
        >
          <div className="flex-1" onClick={() => setExpanded(!expanded)}>
            <CardTitle>Dados da Inspeção</CardTitle>
            <CardDescription>
              {progress === 100 
                ? "Todos os dados obrigatórios preenchidos"
                : `${Math.round(progress)}% dos dados obrigatórios preenchidos`}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditable && (
              isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset(defaultValues);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={updating}
                  >
                    <Check className="h-4 w-4 mr-1" /> Salvar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </CardHeader>

        {expanded && (
          <>
            <CardContent>
              <Progress value={progress} className="mb-4" />
              
              {progress < 100 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start">
                  <span className="text-amber-600 mr-2">⚠</span>
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Dados obrigatórios pendentes</p>
                    <ul className="list-disc pl-5 mt-1">
                      {!form.getValues().companyId && <li>Empresa</li>}
                      {(!form.getValues().responsibleIds || form.getValues().responsibleIds.length === 0) && <li>Responsável</li>}
                      {!form.getValues().location && <li>Localização</li>}
                      {!form.getValues().inspectionType && <li>Tipo de Inspeção</li>}
                    </ul>
                  </div>
                </div>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem className="z-50">
                        <FormLabel>Empresa <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <EnhancedCompanySelector
                            value={field.value ? { label: selectedCompany?.fantasy_name || "Empresa", value: field.value } : null}
                            onSelect={(option) => {
                              if (option) {
                                field.onChange(option);
                                setCompanyError("");
                              }
                            }}
                            className={cn(
                              !isEditing && "opacity-70 pointer-events-none"
                            )}
                            disabled={!isEditing}
                            error={companyError}
                            showTooltip={true}
                          />
                        </FormControl>
                        <FormMessage />
                        {companyError && <p className="text-sm text-destructive">{companyError}</p>}
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="responsibleIds"
                      render={({ field }) => (
                        <FormItem className="z-40">
                          <FormLabel>Responsável(is) <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <EnhancedResponsibleSelector
                              value={field.value.map(id => {
                                const resp = selectedResponsibles.find(r => r.id === id) || {};
                                return { label: resp.name || "Responsável", value: id };
                              })}
                              onSelect={(selectedOptions) => {
                                field.onChange(selectedOptions);
                              }}
                              className={cn(
                                !isEditing && "opacity-70 pointer-events-none"
                              )}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Agendada</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              date={field.value}
                              setDate={field.onChange}
                              className={cn(
                                !isEditing && "opacity-70 pointer-events-none"
                              )}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <LocationPicker
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            onCoordinatesChange={(coords) => {
                              if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
                                form.setValue('coordinates', {
                                  latitude: coords.latitude,
                                  longitude: coords.longitude
                                });
                              } else {
                                form.setValue('coordinates', null);
                              }
                            }}
                            coordinates={form.watch('coordinates')}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="inspectionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Inspeção <span className="text-destructive">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!isEditing}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo">
                                  {field.value && (
                                    <div className="flex items-center">
                                      <span className="mr-2">{getInspectionTypeIcon(field.value)}</span>
                                      <span>
                                        {field.value === "internal" ? "Interna" :
                                         field.value === "external" ? "Externa" :
                                         field.value === "audit" ? "Auditoria" :
                                         field.value === "routine" ? "Rotina" : field.value}
                                      </span>
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="internal">
                                <div className="flex items-center">
                                  <span className="mr-2">🏢</span> Interna
                                </div>
                              </SelectItem>
                              <SelectItem value="external">
                                <div className="flex items-center">
                                  <span className="mr-2">🌐</span> Externa
                                </div>
                              </SelectItem>
                              <SelectItem value="audit">
                                <div className="flex items-center">
                                  <span className="mr-2">📋</span> Auditoria
                                </div>
                              </SelectItem>
                              <SelectItem value="routine">
                                <div className="flex items-center">
                                  <span className="mr-2">🔄</span> Rotina
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!isEditing}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn({
                                  "border-l-4 border-green-500": field.value === "low",
                                  "border-l-4 border-yellow-500": field.value === "medium",
                                  "border-l-4 border-red-500": field.value === "high",
                                })}
                              >
                                <SelectValue placeholder="Selecione a prioridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="low"
                                className="border-l-4 border-green-500 pl-3"
                              >
                                Baixa
                              </SelectItem>
                              <SelectItem
                                value="medium"
                                className="border-l-4 border-yellow-500 pl-3"
                              >
                                Média
                              </SelectItem>
                              <SelectItem
                                value="high"
                                className="border-l-4 border-red-500 pl-3"
                              >
                                Alta
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anotações</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Observações adicionais sobre a inspeção"
                            disabled={!isEditing}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {showHistoryLog && (
                    <div className="border rounded-md p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">Histórico de Alterações</h4>
                      <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                        <p className="text-gray-500">Carregando histórico...</p>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
              {isEditing && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const formData = form.getValues();
                      saveAsDraft(formData);
                    }}
                    disabled={updating}
                    size="sm"
                  >
                    Salvar Rascunho
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={updating || progress !== 100}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updating ? "Salvando..." : "Salvar Dados da Inspeção"}
                  </Button>
                </>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleShowLogs}
                size="sm"
                className="ml-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Logs
              </Button>
              
              <ShareLinkGenerator 
                inspectionId={inspectionId} 
              />
              
              <QRCodeGenerator 
                inspectionId={inspectionId} 
              />
            </CardFooter>
          </>
        )}
      </Card>
    </TooltipProvider>
  );
}
