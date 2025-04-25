
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ChevronDown, ChevronUp, Save, Share, QrCode, Logs } from "lucide-react";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { LocationPicker } from "@/components/inspection/LocationPicker";
import { INSPECTION_STATUSES, InspectionStatus } from "@/types/inspection";
import { cn } from "@/lib/utils";
import { useInspectionHeaderForm } from "@/hooks/inspection/useInspectionHeaderForm";

// Validation schema
const inspectionFormSchema = z.object({
  companyId: z.string().uuid({ message: "Selecione uma empresa válida" }),
  cnae: z.string().regex(/^\d{2}\.\d{2}-\d$/, {
    message: "CNAE deve estar no formato 00.00-0",
  }),
  responsibleId: z.string().uuid({ message: "Selecione um responsável válido" }),
  scheduledDate: z.date().optional(),
  location: z.string().optional(),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  notes: z.string().optional(),
  inspectionType: z.string().default("internal"),
  priority: z.string().default("medium"),
});

export type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

interface InspectionHeaderFormProps {
  inspectionId: string;
  inspection: any;
  company: any;
  responsible: any;
  isEditable: boolean;
  onSave: () => void;
}

export function InspectionHeaderForm({
  inspectionId,
  inspection,
  company,
  responsible,
  isEditable = true,
  onSave,
}: InspectionHeaderFormProps) {
  const [expanded, setExpanded] = useState(true);
  const [saving, setSaving] = useState(false);
  const { updateInspectionData } = useInspectionHeaderForm(inspectionId);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Set default form values from inspection data
  const defaultValues: Partial<InspectionFormValues> = {
    companyId: company?.id || "",
    cnae: inspection?.cnae || "",
    responsibleId: responsible?.id || "",
    scheduledDate: inspection?.scheduled_date ? new Date(inspection.scheduled_date) : undefined,
    location: inspection?.location || "",
    notes: inspection?.metadata?.notes || "",
    inspectionType: inspection?.inspection_type || "internal",
    priority: inspection?.priority || "medium",
  };

  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: InspectionFormValues) => {
    try {
      setSaving(true);
      await updateInspectionData(data);
      toast.success("Dados da inspeção atualizados com sucesso");
      onSave();
    } catch (error: any) {
      console.error("Error updating inspection data:", error);
      toast.error(`Erro ao atualizar dados: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleShareInspection = () => {
    // TO DO: Implement share functionality
    toast.info("Funcionalidade de compartilhamento em desenvolvimento");
  };

  const handleGenerateQrCode = () => {
    // TO DO: Implement QR code generation
    toast.info("Geração de QR Code em desenvolvimento");
  };

  const handleViewLogs = () => {
    // TO DO: Implement logs view
    toast.info("Visualização de logs em desenvolvimento");
  };

  // Function to determine if form is valid enough to proceed
  const isFormValid = () => {
    const { companyId, responsibleId } = form.getValues();
    return !!companyId && !!responsibleId;
  };

  // Helper to handle company selection
  const handleCompanySelect = (id: string, data: any) => {
    form.setValue("companyId", id, { shouldValidate: true });
    if (data?.cnae) {
      form.setValue("cnae", data.cnae, { shouldValidate: true });
    }
    if (data?.address) {
      form.setValue("location", data.address);
    }
  };

  // Helper to handle responsible selection
  const handleResponsibleSelect = (id: string, data: any) => {
    form.setValue("responsibleId", id, { shouldValidate: true });
  };

  // Helper to handle location and coordinates
  const handleLocationChange = (value: string) => {
    form.setValue("location", value);
  };

  const handleCoordinatesChange = (coords: { latitude: number; longitude: number } | null) => {
    if (coords) {
      form.setValue("coordinates", coords);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader 
        className={cn(
          "flex flex-row items-center justify-between space-y-0 cursor-pointer",
          !expanded && "pb-3"
        )} 
        onClick={toggleExpand}
      >
        <div>
          <CardTitle>Dados da Inspeção</CardTitle>
          <CardDescription>
            {isFormValid() 
              ? "Informações configuradas para esta inspeção" 
              : "Preencha os dados obrigatórios antes de prosseguir"}
          </CardDescription>
        </div>
        <div className="flex space-x-2 items-center">
          {isEditable ? (
            expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Somente leitura
            </span>
          )}
        </div>
      </CardHeader>

      {expanded && (
        <>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Empresa e CNAE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <CompanySelector
                            value={field.value}
                            onSelect={handleCompanySelect}
                            className={cn(
                              !isEditable && "opacity-70 pointer-events-none"
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cnae"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNAE <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditable}
                            placeholder="00.00-0"
                          />
                        </FormControl>
                        {field.value && !/^\d{2}\.\d{2}-\d$/.test(field.value) && (
                          <div className="text-sm text-amber-500 flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            O CNAE deve estar no formato 00.00-0
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Responsável e Data Agendada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="responsibleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <ResponsibleSelector
                            value={field.value}
                            onSelect={handleResponsibleSelect}
                            className={cn(
                              !isEditable && "opacity-70 pointer-events-none"
                            )}
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
                              !isEditable && "opacity-70 pointer-events-none"
                            )}
                          />
                        </FormControl>
                        <FormDescription>
                          Opcional: Defina uma data para lembrete
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Localização */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl>
                        <LocationPicker
                          value={field.value || ""}
                          onChange={handleLocationChange}
                          onCoordinatesChange={handleCoordinatesChange}
                          disabled={!isEditable}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Anotações */}
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
                          disabled={!isEditable}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Tipo de Inspeção e Prioridade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="inspectionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Inspeção</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isEditable}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="internal">Interna</SelectItem>
                            <SelectItem value="external">Externa</SelectItem>
                            <SelectItem value="audit">Auditoria</SelectItem>
                            <SelectItem value="routine">Rotina</SelectItem>
                          </SelectContent>
                        </Select>
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
                          disabled={!isEditable}
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
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-between gap-2 border-t pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareInspection}
                type="button"
              >
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateQrCode}
                type="button"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewLogs}
                type="button"
              >
                <Logs className="h-4 w-4 mr-2" />
                Logs
              </Button>
            </div>
            
            {isEditable && (
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={saving || !form.formState.isDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Dados da Inspeção"}
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
