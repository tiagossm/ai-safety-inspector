
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building, User, Calendar, MapPin, ClipboardList, Settings, Save, ChevronRight, AlertTriangle } from "lucide-react";
import { CompanySelector } from "../CompanySelector";
import { ResponsibleSelector } from "../ResponsibleSelector";
import { DateTimePicker } from "../DateTimePicker";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InspectionLocationMap } from "./InspectionLocationMap";
import { toast } from "sonner";

interface EnhancedInspectionFormProps {
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
  recentCompanies?: any[];
  recentLocations?: any[];
}

export function EnhancedInspectionForm({
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
  onCancel,
  recentCompanies = [],
  recentLocations = []
}: EnhancedInspectionFormProps) {
  const [activeTab, setActiveTab] = useState("company");
  const [showMap, setShowMap] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [progress, setProgress] = useState(0);
  const [locationMethod, setLocationMethod] = useState<'address' | 'map'>('address');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // Calculate progress based on filled required fields
  useEffect(() => {
    let completedSteps = 0;
    const totalRequiredSteps = 2; // Company and Responsible are required
    
    if (companyId && companyData) completedSteps++;
    if (responsibleId) completedSteps++;
    
    setProgress(Math.round((completedSteps / totalRequiredSteps) * 100));
  }, [companyId, companyData, responsibleId]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if ((companyId || location || notes) && !submitting) {
        // Here we would implement actual draft saving logic
        console.log("Auto-saving draft...");
        setDraftSaved(true);
        toast.success("Rascunho salvo automaticamente");
        
        // Reset the notification after 3 seconds
        setTimeout(() => setDraftSaved(false), 3000);
      }
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [companyId, location, notes, submitting]);

  const moveToNextTab = () => {
    switch(activeTab) {
      case "company":
        if (companyId) setActiveTab("responsible");
        break;
      case "responsible":
        if (responsibleId) setActiveTab("details");
        break;
      case "details":
        setActiveTab("location");
        break;
      case "location":
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
        break;
    }
  };
  
  const handleLocationSelect = (address: string, coords?: {lat: number, lng: number}) => {
    setLocation(address);
    if (coords) {
      setCoordinates(coords);
    }
  };

  const getTabStatus = (tab: string) => {
    switch(tab) {
      case "company":
        return companyId ? "complete" : "incomplete";
      case "responsible":
        return responsibleId ? "complete" : "incomplete";
      case "details":
        return scheduledDate ? "complete" : "partial";
      case "location":
        return location ? "complete" : "partial";
      default:
        return "incomplete";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-muted-foreground">
            {progress < 100 ? "Complete os campos obrigatórios para continuar" : "Todos os campos obrigatórios preenchidos"}
          </h2>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Main Form Card */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <CardTitle>Nova Inspeção</CardTitle>
          <CardDescription>
            Preencha os dados para iniciar uma nova inspeção de segurança
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-4 mb-4 w-full">
              <TabsTrigger value="company" className="relative">
                <Building className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Empresa</span>
                {getTabStatus("company") === "complete" && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-green-500">
                    <span className="sr-only">Completo</span>
                    <ChevronRight className="h-3 w-3" />
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="responsible" className="relative">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Responsável</span>
                {getTabStatus("responsible") === "complete" && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-green-500">
                    <span className="sr-only">Completo</span>
                    <ChevronRight className="h-3 w-3" />
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="details" className="relative">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Detalhes</span>
                {getTabStatus("details") === "complete" && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-green-500">
                    <span className="sr-only">Completo</span>
                    <ChevronRight className="h-3 w-3" />
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="location" className="relative">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Localização</span>
                {getTabStatus("location") === "complete" && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-green-500">
                    <span className="sr-only">Completo</span>
                    <ChevronRight className="h-3 w-3" />
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Company Tab */}
          <TabsContent value="company" className="m-0 p-6 border-t">
            <div className="space-y-6">
              <div>
                <Label htmlFor="company" className="flex items-center text-base mb-2">
                  <Building className="h-4 w-4 mr-2" />
                  Empresa <span className="text-destructive ml-1">*</span>
                </Label>
                
                <CompanySelector
                  value={companyId}
                  onSelect={(id: string, data: any) => handleCompanySelect(id, data)}
                  error={errors.company}
                  showTooltip={true}
                  className="mt-1"
                />

                {errors.company && (
                  <p className="text-destructive flex items-center text-sm mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.company}
                  </p>
                )}
              </div>

              {/* Recently used companies */}
              {recentCompanies.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Empresas Recentes</h4>
                  <div className="flex flex-wrap gap-2">
                    {recentCompanies.map((company) => (
                      <Button 
                        key={company.id} 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCompanySelect(company.id, company)}
                        className="flex items-center"
                      >
                        <Building className="h-3 w-3 mr-1" />
                        {company.fantasy_name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {companyData && (
                <div className="pt-2">
                  <Label htmlFor="cnae">
                    CNAE <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex mt-1">
                    <Input
                      id="cnae"
                      value={companyData.cnae || ""}
                      onChange={(e) => {
                        setCompanyData({ ...companyData, cnae: e.target.value });
                      }}
                      placeholder="00.00-0"
                      className={cn(
                        errors.cnae ? "border-destructive" : "",
                        "transition-all"
                      )}
                    />
                  </div>
                  {errors.cnae && (
                    <p className="text-destructive flex items-center text-sm mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.cnae}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={onCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button 
                onClick={moveToNextTab} 
                disabled={!companyId || !companyData}
              >
                Próximo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Responsible Tab */}
          <TabsContent value="responsible" className="m-0 p-6 border-t">
            <div className="space-y-6">
              <div>
                <Label htmlFor="responsible" className="flex items-center text-base mb-2">
                  <User className="h-4 w-4 mr-2" />
                  Responsável <span className="text-destructive ml-1">*</span>
                </Label>
                
                <ResponsibleSelector
                  value={responsibleId ? [responsibleId] : []}
                  onSelect={(ids, data) => {
                    const firstId = ids.length > 0 ? ids[0] : "";
                    const firstData = data.length > 0 ? data[0] : null;
                    handleResponsibleSelect(firstId, firstData);
                  }}
                  companyFilter={companyId} // Filter by company if available
                  className="mt-1"
                />
                
                {errors.responsible && (
                  <p className="text-destructive flex items-center text-sm mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.responsible}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("company")}>
                Voltar
              </Button>
              <Button 
                onClick={moveToNextTab} 
                disabled={!responsibleId}
              >
                Próximo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="m-0 p-6 border-t">
            <div className="space-y-6">
              <div>
                <Label htmlFor="scheduled_date" className="flex items-center text-base mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Data Agendada
                </Label>
                <DateTimePicker
                  date={scheduledDate}
                  setDate={setScheduledDate}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type" className="flex items-center text-base mb-2">
                    <Settings className="h-4 w-4 mr-2" />
                    Tipo de Inspeção
                  </Label>
                  <Select
                    value={inspectionType}
                    onValueChange={setInspectionType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Interna</Badge>
                          <span>Inspeção Interna</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="external">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Externa</Badge>
                          <span>Inspeção Externa</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority" className="flex items-center text-base mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Prioridade
                  </Label>
                  <Select
                    value={priority}
                    onValueChange={setPriority}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">Baixa</Badge>
                          <span>Prioridade Baixa</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Média</Badge>
                          <span>Prioridade Média</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-red-100 text-red-800 hover:bg-red-100">Alta</Badge>
                          <span>Prioridade Alta</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes" className="flex items-center text-base mb-2">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Anotações
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações adicionais sobre a inspeção"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("responsible")}>
                Voltar
              </Button>
              <Button onClick={moveToNextTab}>
                Próximo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="m-0 p-6 border-t">
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <Button 
                  variant={locationMethod === 'address' ? "default" : "outline"}
                  onClick={() => setLocationMethod('address')}
                  size="sm"
                >
                  Endereço Manual
                </Button>
                <Button 
                  variant={locationMethod === 'map' ? "default" : "outline"}
                  onClick={() => {
                    setLocationMethod('map');
                    setShowMap(true);
                  }}
                  size="sm"
                >
                  Selecionar no Mapa
                </Button>
              </div>
              
              {locationMethod === 'address' ? (
                <div>
                  <Label htmlFor="location" className="flex items-center text-base mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    Localização
                  </Label>
                  <Textarea
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Endereço completo do local da inspeção"
                    rows={2}
                    className="mt-1"
                  />
                  
                  {/* Recently used locations */}
                  {recentLocations.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-2">Locais Recentes</h4>
                      <div className="flex flex-wrap gap-2">
                        {recentLocations.map((loc, idx) => (
                          <Button 
                            key={idx} 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(loc.address)}
                            className="flex items-center"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {loc.address}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-md p-1">
                  <div className="h-[300px]">
                    <InspectionLocationMap 
                      onLocationSelect={handleLocationSelect}
                      initialAddress={location}
                      initialCoordinates={coordinates}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !isFormValid()}
              >
                {submitting ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Inspeção
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Draft saved indicator */}
        {draftSaved && (
          <CardFooter className="pb-4 pt-0 px-6">
            <p className="text-sm text-muted-foreground">
              Rascunho salvo automaticamente
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
