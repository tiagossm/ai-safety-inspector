
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

interface InspectionTabsSectionProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
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
  // Reuse handler for debug mode (if further splitting wanted)
  // (Code stays mostly the same as original)

  return (
    <div className="bg-card p-6 rounded-lg border border-border mb-6">
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="advanced">Configurações</TabsTrigger>
          {debugMode && <TabsTrigger value="debug">Debug</TabsTrigger>}
        </TabsList>
        <TabsContent value="basic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="space-y-2">
              <FormLabel htmlFor="scheduledDate">
                Data Agendada
              </FormLabel>
              <DateTimePicker
                date={formData.scheduledDate}
                setDate={(date) => updateFormField("scheduledDate", date)}
              />
            </div>
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
            <div className="space-y-4">
              <FormLabel>
                Tipo de Inspeção
              </FormLabel>
              {/* ... type radio group ... */}
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <input
                    type="radio"
                    checked={formData.inspectionType === "internal"}
                    onChange={() => updateFormField("inspectionType", "internal")}
                  />
                  Interna
                </label>
                <label>
                  <input
                    type="radio"
                    checked={formData.inspectionType === "external"}
                    onChange={() => updateFormField("inspectionType", "external")}
                  />
                  Externa
                </label>
                <label>
                  <input
                    type="radio"
                    checked={formData.inspectionType === "audit"}
                    onChange={() => updateFormField("inspectionType", "audit")}
                  />
                  Auditoria
                </label>
                <label>
                  <input
                    type="radio"
                    checked={formData.inspectionType === "routine"}
                    onChange={() => updateFormField("inspectionType", "routine")}
                  />
                  Rotina
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <FormLabel>
                Prioridade
              </FormLabel>
              {/* ... priority radio group ... */}
              <div className="grid grid-cols-3 gap-4">
                <label>
                  <input
                    type="radio"
                    checked={formData.priority === "low"}
                    onChange={() => updateFormField("priority", "low")}
                  />
                  Baixa
                </label>
                <label>
                  <input
                    type="radio"
                    checked={formData.priority === "medium"}
                    onChange={() => updateFormField("priority", "medium")}
                  />
                  Média
                </label>
                <label>
                  <input
                    type="radio"
                    checked={formData.priority === "high"}
                    onChange={() => updateFormField("priority", "high")}
                  />
                  Alta
                </label>
              </div>
            </div>
          </div>
        </TabsContent>
        {debugMode && (
          <TabsContent value="debug">
            <div className="p-4 bg-black text-green-400 font-mono rounded-md overflow-auto max-h-[400px]">
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
