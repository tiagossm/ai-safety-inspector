
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
import { ChevronDown, ChevronUp, Save, QrCode, Share, FileText } from "lucide-react";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
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

// Update the coordinates schema to match the new type in InspectionFormValues
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
  isEditable = true, // Default to true so the form is always editable
  onSave,
}: InspectionHeaderFormProps) {
  const [expanded, setExpanded] = useState(true);
  const [showHistoryLog, setShowHistoryLog] = useState(false);
  const { updateInspectionData, validateRequiredFields, saveAsDraft, updating } = useInspectionHeaderForm(inspectionId);
  const [progress, setProgress] = useState(0);

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

  // Initialize responsibleIds from either the array or a single ID for backward compatibility
  const initialResponsibleIds = inspection?.responsible_ids?.length 
    ? inspection.responsible_ids 
    : (responsible?.id ? [responsible.id] : []);

  console.log("Initial form data:", {
    inspectionId,
    companyId: company?.id,
    responsibleIds: initialResponsibleIds,
    inspection
  });

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

  // Force form values to be set from props when they change
  React.useEffect(() => {
    if (company?.id) {
      form.setValue('companyId', company.id);
    }
    if (initialResponsibleIds.length) {
      form.setValue('responsibleIds', initialResponsibleIds);
    }
    if (inspection?.scheduled_date) {
      form.setValue('scheduledDate', new Date(inspection.scheduled_date));
    }
    if (inspection?.location) {
      form.setValue('location', inspection.location);
    }
    if (inspection?.metadata?.notes) {
      form.setValue('notes', inspection.metadata.notes);
    }
    if (inspection?.inspection_type) {
      form.setValue('inspectionType', inspection.inspection_type);
    }
    if (inspection?.priority) {
      form.setValue('priority', inspection.priority);
    }
  }, [company, inspection, responsible, form]);

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
      // Ensure coordinates are properly validated before submitting
      if (data.coordinates && (
          typeof data.coordinates.latitude !== 'number' ||
          typeof data.coordinates.longitude !== 'number'
      )) {
        // Set coordinates to null if they're invalid
        data.coordinates = null;
      }
      
      await updateInspectionData(data);
      onSave();
    } catch (error) {
      // Error is handled by the hook
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
      // Error is handled by the hook
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
    <Card className="mb-6">
      <CardHeader 
        className={cn(
          "flex flex-row items-center justify-between space-y-0 cursor-pointer",
          !expanded && "pb-3"
        )} 
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <CardTitle>Dados da Inspeção</CardTitle>
          <CardDescription>
            {progress === 100 
              ? "Todos os dados obrigatórios preenchidos"
              : `${Math.round(progress)}% dos dados obrigatórios preenchidos`}
          </CardDescription>
        </div>
        <div className="flex space-x-2 items-center">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
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
                    <FormItem>
                      <FormLabel>Empresa <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <CompanySelector
                          value={field.value}
                          onSelect={(id, data) => {
                            field.onChange(id);
                            if (data?.address && !form.getValues().location) {
                              form.setValue('location', data.address);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="responsibleIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável(is) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <ResponsibleSelector
                            value={field.value}
                            onSelect={(ids, data) => field.onChange(ids)}
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
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsDraft}
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
  );
}
