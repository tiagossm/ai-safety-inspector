
import React from "react";
import { FormLabel } from "@/components/ui/form";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { LocationPicker } from "@/components/inspection/LocationPicker";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { StartInspectionFormData } from "@/hooks/inspection/useStartInspection";

interface InspectionTabsSectionProps {
  formData: any;
  updateFormField: (field: keyof StartInspectionFormData | string, value: any) => void;
  formErrors: Record<string, string>;
  checklist: any;
  debugMode: boolean;
  setDebugMode: (v: boolean) => void;
  setDebugClickCount: (v: number) => void;
}

export default function InspectionTabsSection({
  formData,
  updateFormField,
  formErrors,
  checklist,
  debugMode,
  setDebugMode,
  setDebugClickCount,
}: InspectionTabsSectionProps) {
  const { control, setValue, watch } = useFormContext();

  // Function to update both the form context and the parent state
  const handleFieldUpdate = (field: keyof StartInspectionFormData | string, value: any) => {
    setValue(field as string, value);
    updateFormField(field, value);
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border mb-6">
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="advanced">Configurações</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          {debugMode && <TabsTrigger value="debug">Debug</TabsTrigger>}
        </TabsList>
        <TabsContent value="basic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormLabel htmlFor="company" className={formErrors.company ? "text-destructive" : ""}>
                Empresa <span className="text-destructive">*</span>
              </FormLabel>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <CompanySelector
                    value={field.value}
                    onSelect={(id, data) => {
                      handleFieldUpdate("companyId", id);
                      handleFieldUpdate("companyData", data);
                    }}
                    className={formErrors.company ? "border-destructive" : ""}
                  />
                )}
              />
              {formErrors.company && (
                <p className="text-sm text-destructive">{formErrors.company}</p>
              )}
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="cnae" className={formErrors.cnae ? "text-destructive" : ""}>
                CNAE
              </FormLabel>
              <div className="relative">
                <Controller
                  name="companyData.cnae"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="cnae"
                      placeholder="00.00-0"
                      value={field.value || ""}
                      onChange={(e) => {
                        const newData = { ...(formData.companyData || {}), cnae: e.target.value };
                        handleFieldUpdate("companyData", newData);
                      }}
                      className={formErrors.cnae ? "border-destructive" : ""}
                    />
                  )}
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
            <div className="space-y-2">
              <FormLabel htmlFor="responsible" className={formErrors.responsible ? "text-destructive" : ""}>
                Responsável <span className="text-destructive">*</span>
              </FormLabel>
              <Controller
                name="responsibleId"
                control={control}
                render={({ field }) => (
                  <ResponsibleSelector
                    value={field.value}
                    onSelect={(id, data) => {
                      handleFieldUpdate("responsibleId", id);
                      handleFieldUpdate("responsibleData", data);
                    }}
                    className={formErrors.responsible ? "border-destructive" : ""}
                  />
                )}
              />
              {formErrors.responsible && (
                <p className="text-sm text-destructive">{formErrors.responsible}</p>
              )}
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="location" className={formErrors.location ? "text-destructive" : ""}>
                Localização <span className="text-destructive">*</span>
              </FormLabel>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <LocationPicker
                    value={field.value}
                    onChange={(value) => handleFieldUpdate("location", value)}
                    onCoordinatesChange={(coords) => handleFieldUpdate("coordinates", coords)}
                    coordinates={formData.coordinates}
                  />
                )}
              />
              {formErrors.location && (
                <p className="text-sm text-destructive">{formErrors.location}</p>
              )}
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="scheduledDate">
                Data Agendada
              </FormLabel>
              <Controller
                name="scheduledDate"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    date={field.value}
                    setDate={(date) => handleFieldUpdate("scheduledDate", date)}
                  />
                )}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <FormLabel htmlFor="notes">
                Observações
              </FormLabel>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="notes"
                    placeholder="Adicione observações relevantes para a inspeção"
                    value={field.value || ""}
                    onChange={(e) => handleFieldUpdate("notes", e.target.value)}
                    className="min-h-[100px]"
                  />
                )}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="advanced">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormLabel>
                Tipo de Inspeção
              </FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="inspectionType"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "internal"}
                          onChange={() => handleFieldUpdate("inspectionType", "internal")}
                          className="h-4 w-4"
                        />
                        <span>Interna</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "external"}
                          onChange={() => handleFieldUpdate("inspectionType", "external")}
                          className="h-4 w-4"
                        />
                        <span>Externa</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "audit"}
                          onChange={() => handleFieldUpdate("inspectionType", "audit")}
                          className="h-4 w-4"
                        />
                        <span>Auditoria</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "routine"}
                          onChange={() => handleFieldUpdate("inspectionType", "routine")}
                          className="h-4 w-4"
                        />
                        <span>Rotina</span>
                      </label>
                    </>
                  )}
                />
              </div>
            </div>
            <div className="space-y-4">
              <FormLabel>
                Prioridade
              </FormLabel>
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "low"}
                          onChange={() => handleFieldUpdate("priority", "low")}
                          className="h-4 w-4"
                        />
                        <span>Baixa</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "medium"}
                          onChange={() => handleFieldUpdate("priority", "medium")}
                          className="h-4 w-4"
                        />
                        <span>Média</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "high"}
                          onChange={() => handleFieldUpdate("priority", "high")}
                          className="h-4 w-4"
                        />
                        <span>Alta</span>
                      </label>
                    </>
                  )}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="users">
          <div className="space-y-4">
            <FormLabel>
              Usuários da Inspeção
            </FormLabel>
            <Controller
              name="assignedUsers"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione os usuários que podem editar e executar esta inspeção:
                  </p>
                  <div className="border rounded-md p-4">
                    <p className="text-sm italic text-muted-foreground">
                      A funcionalidade de seleção de múltiplos usuários será implementada aqui.
                      Por enquanto, apenas o responsável principal pode executar a inspeção.
                    </p>
                  </div>
                </div>
              )}
            />
          </div>
        </TabsContent>
        {debugMode && (
          <TabsContent value="debug">
            <div className="p-4 bg-black text-green-400 font-mono rounded-md overflow-auto max-h-[400px]">
              <pre>{JSON.stringify(formData, null, 2)}</pre>
              <div className="mt-4 pt-4 border-t border-green-500">
                <div className="text-yellow-400 mb-2">React Hook Form Values:</div>
                <pre>{JSON.stringify(watch(), null, 2)}</pre>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
