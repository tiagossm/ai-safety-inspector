
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useFormSelectionData } from "@/hooks/inspection/useFormSelectionData";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { LocationPicker } from "@/components/inspection/enhanced/LocationPicker";
import { Loader2 } from "lucide-react";

interface InspectionDataFormProps {
  inspection: any;
  company: any;
  responsible: any;
  responsibles: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const INSPECTION_TYPES = [
  { label: "Interna", value: "internal" },
  { label: "Externa", value: "external" },
  { label: "Periódica", value: "periodic" },
  { label: "Emergencial", value: "emergency" }
];

const PRIORITY_LEVELS = [
  { label: "Baixa", value: "low" },
  { label: "Média", value: "medium" },
  { label: "Alta", value: "high" },
  { label: "Crítica", value: "critical" }
];

export function InspectionDataForm({
  inspection,
  company,
  responsible,
  responsibles: providedResponsibles,
  onSave,
  onCancel,
  isSaving
}: InspectionDataFormProps) {
  // Use the form selection data hook for companies and responsibles
  const { companies, loadingCompanies, loadingResponsibles } = useFormSelectionData();
  
  const [formData, setFormData] = useState({
    companyId: company?.id || "",
    responsibleIds: responsible ? [responsible.id] : [],
    scheduledDate: inspection.scheduled_date || "",
    location: inspection.location || "",
    coordinates: inspection.metadata?.coordinates || null,
    type: inspection.type || inspection.inspection_type || "internal",
    priority: inspection.priority || "medium",
    notes: inspection.metadata?.notes || ""
  });
  
  const handleCompanySelect = (companyId: string, companyData: any) => {
    setFormData(prev => ({
      ...prev,
      companyId
    }));
    
    // Update location with company address if available
    if (companyData?.address) {
      setFormData(prev => ({
        ...prev,
        location: companyData.address
      }));
    }
  };

  const handleResponsibleSelect = (responsibleIds: string[], responsibleData: any[]) => {
    setFormData(prev => ({
      ...prev,
      responsibleIds
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (location: string) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleCoordinatesChange = (coords: { latitude: number; longitude: number } | null) => {
    setFormData(prev => ({
      ...prev,
      coordinates: coords
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      ...formData,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
    });
  };

  // Field validation
  const isCompanyValid = !!formData.companyId;
  const isResponsibleValid = formData.responsibleIds.length > 0;
  const isFormValid = isCompanyValid && isResponsibleValid;

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyId" className="flex items-center">
              Empresa <span className="text-destructive ml-1">*</span>
            </Label>
            <CompanySelector 
              value={formData.companyId}
              onSelect={handleCompanySelect}
              disabled={isSaving}
              error={!isCompanyValid && formData.companyId !== "" ? "Empresa é obrigatória" : undefined}
              showTooltip={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibleId" className="flex items-center">
              Responsável <span className="text-destructive ml-1">*</span>
            </Label>
            <ResponsibleSelector 
              value={formData.responsibleIds}
              onSelect={handleResponsibleSelect}
              disabled={isSaving}
              showTooltip={true}
              companyId={formData.companyId}
            />
            {!isResponsibleValid && formData.responsibleIds.length === 0 && (
              <p className="text-sm text-destructive">Responsável é obrigatório</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Data Agendada</Label>
            <Input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate ? format(new Date(formData.scheduledDate), "yyyy-MM-dd") : ""}
              onChange={handleInputChange}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="flex items-center">
              Tipo de Inspeção <span className="text-destructive ml-1">*</span>
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {INSPECTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <LocationPicker 
            value={formData.location}
            onChange={handleLocationChange}
            onCoordinatesChange={handleCoordinatesChange}
            coordinates={formData.coordinates}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => handleSelectChange("priority", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent className="z-[100] bg-white">
              {PRIORITY_LEVELS.map(priority => (
                <SelectItem key={priority.value} value={priority.value} className="cursor-pointer">
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Anotações</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Anotações adicionais sobre a inspeção"
            rows={3}
            className="resize-none bg-white"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving || !isFormValid}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
