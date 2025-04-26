import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
import { ComboboxDemo, MultiSelect } from "@/components/ui/combobox";
import { useCEP } from "@/hooks/useCEP";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  responsibles,
  onSave,
  onCancel,
  isSaving
}: InspectionDataFormProps) {
  const [formData, setFormData] = useState({
    companyId: company?.id || "",
    responsibleIds: responsible ? [responsible.id] : [],
    scheduledDate: inspection.scheduled_date || "",
    location: inspection.location || "",
    cep: "",
    type: inspection.type || "Padrão",
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

  const handleMultiSelectChange = (name: string, values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: values
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
    onSave({
      ...formData,
      locationCoords
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyId">Empresa</Label>
          <ComboboxDemo
            value={formData.companyId}
            onChange={(value) => handleSelectChange("companyId", value)}
            options={[{ label: company?.name || "Selecione uma empresa", value: company?.id || "" }]}
            placeholder="Selecione uma empresa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsibleIds">Responsável(is)</Label>
          <MultiSelect
            options={(responsibles || []).map(r => ({ label: r.name, value: r.id }))}
            selected={formData.responsibleIds}
            onChange={(values) => handleMultiSelectChange("responsibleIds", values)}
            placeholder="Selecione um ou mais responsáveis"
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
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
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
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Salvar
        </Button>
      </div>
    </form>
  );
}
