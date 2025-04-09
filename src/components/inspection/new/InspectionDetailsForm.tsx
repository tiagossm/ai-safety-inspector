import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { AlertTriangle, Building, CalendarIcon, ClipboardList, MapPin, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InspectionDetailsFormProps {
  loading: boolean;
  submitting: boolean;
  companyId: string;
  companyData: any;
  setCompanyData: (data: any) => void;
  responsibleId: string;
  location: string;
  setLocation: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  inspectionType: string;
  setInspectionType: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  scheduledDate: Date | undefined;
  setScheduledDate: (date: Date | undefined) => void;
  errors: Record<string, string>;
  handleCompanySelect: (id: string, data: any) => void;
  handleResponsibleSelect: (id: string, data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isFormValid: () => boolean;
  onCancel: () => void;
}

export function InspectionDetailsForm({
  loading,
  submitting,
  companyId,
  companyData,
  setCompanyData,
  responsibleId,
  location,
  setLocation,
  notes,
  setNotes,
  inspectionType,
  setInspectionType,
  priority,
  setPriority,
  scheduledDate,
  setScheduledDate,
  errors,
  handleCompanySelect,
  handleResponsibleSelect,
  handleSubmit,
  isFormValid,
  onCancel
}: InspectionDetailsFormProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-40" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Inspeção</CardTitle>
        <CardDescription>
          Preencha os dados para iniciar a inspeção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company selection */}
        <div>
          <Label htmlFor="company" className="flex items-center">
            <Building className="h-4 w-4 mr-1" />
            Empresa <span className="text-destructive ml-1">*</span>
          </Label>
          <div className="mt-1.5">
            <CompanySelector
              value={companyId}
              onSelect={(id) => handleCompanySelect(id, null)}
            />
            {errors.company && (
              <span className="text-sm text-destructive">{errors.company}</span>
            )}
          </div>
        </div>
        
        {/* CNAE display */}
        {companyData && (
          <div>
            <Label htmlFor="cnae">
              CNAE <span className="text-destructive">*</span>
            </Label>
            <div className="flex mt-1.5">
              <Input
                id="cnae"
                value={companyData.cnae || ""}
                onChange={(e) => {
                  setCompanyData({ ...companyData, cnae: e.target.value });
                }}
                placeholder="00.00-0"
                className={errors.cnae ? "border-destructive" : ""}
              />
            </div>
            {errors.cnae && (
              <span className="text-sm text-destructive">{errors.cnae}</span>
            )}
            {companyData.cnae && !/^\d{2}\.\d{2}-\d$/.test(companyData.cnae) && (
              <span className="text-sm text-amber-500 flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                O CNAE deve estar no formato 00.00-0
              </span>
            )}
          </div>
        )}
        
        {/* Responsible */}
        <div>
          <Label htmlFor="responsible" className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            Responsável <span className="text-destructive ml-1">*</span>
          </Label>
          <div className="mt-1.5">
            <ResponsibleSelector
              value={responsibleId}
              onSelect={handleResponsibleSelect}
            />
            {errors.responsible && (
              <span className="text-sm text-destructive">{errors.responsible}</span>
            )}
          </div>
        </div>
        
        {/* Scheduled date */}
        <div>
          <Label htmlFor="scheduled_date" className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Data Agendada
          </Label>
          <div className="mt-1.5">
            <DateTimePicker
              date={scheduledDate}
              setDate={setScheduledDate}
            />
          </div>
        </div>
        
        {/* Location */}
        <div>
          <Label htmlFor="location" className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Localização
          </Label>
          <div className="mt-1.5">
            <Textarea
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Endereço completo do local da inspeção"
              rows={2}
            />
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="flex items-center">
            <ClipboardList className="h-4 w-4 mr-1" />
            Anotações
          </Label>
          <div className="mt-1.5">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais sobre a inspeção"
              rows={3}
            />
          </div>
        </div>
        
        {/* Inspection type and priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tipo de Inspeção</Label>
            <Select
              value={inspectionType}
              onValueChange={setInspectionType}
            >
              <SelectTrigger className="mt-1.5">
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
          
          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={priority}
              onValueChange={setPriority}
            >
              <SelectTrigger className="mt-1.5">
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
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={submitting || !isFormValid()}
        >
          {submitting ? "Processando..." : "Iniciar Inspeção"}
        </Button>
      </CardFooter>
    </Card>
  );
}
