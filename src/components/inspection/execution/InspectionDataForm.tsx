
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
import { useCEP } from "@/hooks/useCEP";
import { format } from "date-fns";
import { useFormSelectionData } from "@/hooks/inspection/useFormSelectionData";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";

interface InspectionDataFormProps {
  inspection: any;
  company: any;
  responsible: any;
  responsibles: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

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
  const { companies, responsibles, loadingCompanies, loadingResponsibles } = useFormSelectionData();
  
  const [formData, setFormData] = useState({
    companyId: company?.id || "",
    responsibleIds: responsible ? [responsible.id] : [],
    scheduledDate: inspection.scheduled_date || "",
    location: inspection.location || "",
    cep: "",
    type: inspection.type || inspection.inspection_type || "Padrão",
    priority: inspection.priority || "medium",
    notes: inspection.notes || ""
  });
  
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{lat: number; lng: number} | null>(null);
  
  const { address, loading: loadingCEP, error: cepError, fetchAddress } = useCEP();

  useEffect(() => {
    if (address) {
      const fullAddress = `${address.logradouro}, ${address.bairro}, ${address.localidade} - ${address.uf}, ${address.cep}`;
      setFormData(prev => ({
        ...prev,
        location: fullAddress
      }));
    }
  }, [address]);

  const handleCEPSearch = () => {
    if (formData.cep.length >= 8) {
      fetchAddress(formData.cep);
    }
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

  const handleResponsibleSelect = (responsibleIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      responsibleIds
    }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setUseGeolocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationCoords({ lat: latitude, lng: longitude });
          setFormData(prev => ({
            ...prev,
            location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          }));
          setUseGeolocation(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setUseGeolocation(false);
        }
      );
    } else {
      alert("Geolocalização não é suportada pelo seu navegador");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the company and responsible data for the selected IDs
    const selectedCompany = companies.find(c => c.id === formData.companyId) || company;
    const selectedResponsible = responsibles.find(r => r.id === formData.responsibleIds[0]) || responsible;
    
    onSave({
      ...formData,
      company: selectedCompany,
      responsible: selectedResponsible,
      locationCoords
    });
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyId">Empresa</Label>
            <CompanySelector 
              value={formData.companyId}
              onSelect={handleCompanySelect}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibleId">Responsável</Label>
            <ResponsibleSelector 
              value={formData.responsibleIds}
              onSelect={(ids) => handleResponsibleSelect(ids)}
              disabled={isSaving}
            />
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                maxLength={9}
                placeholder="00000-000"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCEPSearch}
                disabled={loadingCEP || formData.cep.length < 8}
              >
                {loadingCEP ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Endereço da inspeção"
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGetLocation}
              disabled={useGeolocation}
            >
              {useGeolocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><MapPin className="h-4 w-4 mr-1" /> GPS</>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Inspeção</Label>
            <Input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="Tipo de inspeção"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleSelectChange("priority", value)}
            >
              <SelectTrigger className="bg-white border border-input">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="low" className="cursor-pointer">Baixa</SelectItem>
                <SelectItem value="medium" className="cursor-pointer">Média</SelectItem>
                <SelectItem value="high" className="cursor-pointer">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Salvar
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
