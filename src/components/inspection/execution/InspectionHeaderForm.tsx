
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
import { ChevronDown, ChevronUp, Save } from "lucide-react";
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

const inspectionFormSchema = z.object({
  companyId: z.string().uuid({ message: "Selecione uma empresa válida" }),
  responsibleId: z.string().uuid({ message: "Selecione um responsável válido" }),
  scheduledDate: z.date().optional().nullable(),
  location: z.string().min(1, "Localização é obrigatória"),
  inspectionType: z.string().min(1, "Tipo de inspeção é obrigatório"),
  priority: z.string().default("medium"),
  notes: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional().nullable()
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
  const { updateInspectionData, validateRequiredFields, saveAsDraft, updating } = useInspectionHeaderForm(inspectionId);
  const [progress, setProgress] = useState(0);

  // Process coordinates to ensure they match the required type
  const processCoordinates = (coords: any) => {
    if (!coords) return null;
    
    // Ensure both latitude and longitude are numbers
    if (typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
      return {
        latitude: coords.latitude,
        longitude: coords.longitude
      };
    }
    return null;
  };

  // Set default form values from inspection data with proper typing
  const defaultValues: Partial<InspectionFormValues> = {
    companyId: company?.id || "",
    responsibleId: responsible?.id || "",
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

  // Calculate form completion progress
  const calculateProgress = (data: Partial<InspectionFormValues>) => {
    const requiredFields = ['companyId', 'responsibleId', 'location', 'inspectionType'];
    const filledFields = requiredFields.filter(field => !!data[field as keyof InspectionFormValues]);
    return (filledFields.length / requiredFields.length) * 100;
  };

  // Update progress when form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setProgress(calculateProgress(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: InspectionFormValues) => {
    try {
      await updateInspectionData(data);
      onSave();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      await saveAsDraft(form.getValues());
    } catch (error) {
      // Error is handled by the hook
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
            <Progress value={progress} className="mb-4" />
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Empresa */}
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <CompanySelector
                          value={field.value}
                          onSelect={(id, data) => field.onChange(id)}
                          className={cn(
                            !isEditable && "opacity-70 pointer-events-none"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                            onSelect={(id, data) => field.onChange(id)}
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
                      <FormLabel>Localização <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <LocationPicker
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          onCoordinatesChange={(coords) => {
                            if (coords) {
                              form.setValue('coordinates', {
                                latitude: coords.latitude,
                                longitude: coords.longitude
                              });
                            } else {
                              form.setValue('coordinates', null);
                            }
                          }}
                          disabled={!isEditable}
                        />
                      </FormControl>
                      <FormMessage />
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
                        <FormLabel>Tipo de Inspeção <span className="text-destructive">*</span></FormLabel>
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
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={updating || !isEditable}
            >
              Salvar Rascunho
            </Button>
            
            {isEditable && (
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={updating || progress !== 100}
              >
                <Save className="h-4 w-4 mr-2" />
                {updating ? "Salvando..." : "Salvar Dados da Inspeção"}
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
