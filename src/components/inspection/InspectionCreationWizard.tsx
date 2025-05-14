
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle, ClipboardCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowProgress } from "@/components/workflow/WorkflowProgress";
import { useCompanies } from "@/hooks/useCompanies";
import { useChecklists } from "@/hooks/useChecklists";
import { useCreateInspection } from "@/hooks/inspection/useCreateInspection";

const steps = [
  { id: "checklist", label: "Checklist" },
  { id: "company", label: "Empresa" },
  { id: "details", label: "Detalhes" },
  { id: "review", label: "Revisar" },
];

export function InspectionCreationWizard() {
  const [currentStep, setCurrentStep] = useState("checklist");
  const [formData, setFormData] = useState({
    checklistId: "",
    companyId: "",
    responsibleId: "",
    scheduledDate: "",
    location: "",
    notes: "",
  });
  
  const navigate = useNavigate();
  const { companies, loading: loadingCompanies } = useCompanies();
  const { checklists, isLoading: loadingChecklists } = useChecklists();
  const { createInspection, creating, error } = useCreateInspection();
  
  // Map steps for the workflow progress component
  const workflowSteps = steps.map(step => ({
    ...step,
    completed: getStepIndex(currentStep) > getStepIndex(step.id),
    current: currentStep === step.id,
  }));
  
  function getStepIndex(stepId: string): number {
    return steps.findIndex(s => s.id === stepId);
  }
  
  function goToNextStep() {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  }
  
  function goToPreviousStep() {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  }
  
  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }
  
  async function handleCreateInspection() {
    try {
      if (!formData.checklistId) {
        alert("Por favor, selecione um checklist");
        return;
      }
      
      const inspection = await createInspection(
        formData.checklistId, 
        formData.companyId, 
        formData.responsibleId,
        formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
        formData.location
      );
      
      navigate(`/inspections/${inspection.id}/view`);
    } catch (err) {
      console.error("Erro ao criar inspeção:", err);
    }
  }
  
  // Find selected checklist and company objects
  const selectedChecklist = checklists.find(c => c.id === formData.checklistId);
  const selectedCompany = companies.find(c => c.id === formData.companyId);
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Nova Inspeção</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <WorkflowProgress steps={workflowSteps} />
      </div>
      
      {/* Step content */}
      <Card className="mb-6">
        {currentStep === "checklist" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Selecione um Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checklist">Checklist</Label>
                  <Select 
                    value={formData.checklistId} 
                    onValueChange={value => handleInputChange("checklistId", value)}
                  >
                    <SelectTrigger id="checklist">
                      <SelectValue placeholder="Selecione um checklist" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingChecklists ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : checklists.length === 0 ? (
                        <SelectItem value="empty" disabled>Nenhum checklist encontrado</SelectItem>
                      ) : (
                        checklists.map(checklist => (
                          <SelectItem key={checklist.id} value={checklist.id}>
                            {checklist.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.checklistId && !selectedChecklist?.isTemplate && selectedChecklist?.companyId && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      Este checklist já está vinculado a uma empresa. 
                      Alguns campos serão preenchidos automaticamente.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/new-checklists/create")}
                  >
                    Criar Novo Checklist
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={goToNextStep} disabled={!formData.checklistId}>
                Próximo
              </Button>
            </CardFooter>
          </>
        )}
        
        {currentStep === "company" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Selecione a Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Select 
                    value={formData.companyId} 
                    onValueChange={value => handleInputChange("companyId", value)}
                    disabled={selectedChecklist?.companyId !== undefined}
                  >
                    <SelectTrigger id="company">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCompanies ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : companies.length === 0 ? (
                        <SelectItem value="empty" disabled>Nenhuma empresa encontrada</SelectItem>
                      ) : (
                        companies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.fantasy_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {selectedChecklist?.companyId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Empresa vinculada automaticamente pelo checklist
                    </p>
                  )}
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/companies")}
                  >
                    Cadastrar Nova Empresa
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousStep}>
                Voltar
              </Button>
              <Button onClick={goToNextStep} disabled={!formData.companyId && !selectedChecklist?.companyId}>
                Próximo
              </Button>
            </CardFooter>
          </>
        )}
        
        {currentStep === "details" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Detalhes da Inspeção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="responsible">Responsável</Label>
                  <Input
                    id="responsible"
                    placeholder="Nome do responsável"
                    value={formData.responsibleId}
                    onChange={e => handleInputChange("responsibleId", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Data Programada</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={e => handleInputChange("scheduledDate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    placeholder="Local da inspeção"
                    value={formData.location}
                    onChange={e => handleInputChange("location", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais"
                    value={formData.notes}
                    onChange={e => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousStep}>
                Voltar
              </Button>
              <Button onClick={goToNextStep}>
                Próximo
              </Button>
            </CardFooter>
          </>
        )}
        
        {currentStep === "review" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Revisar e Confirmar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Checklist</p>
                    <p className="font-medium">{selectedChecklist?.title || "Não selecionado"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                    <p className="font-medium">{selectedCompany?.fantasy_name || "Não selecionada"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                    <p className="font-medium">{formData.responsibleId || "Não definido"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Data Programada</p>
                    <p className="font-medium">
                      {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString() : "Não definida"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Localização</p>
                    <p className="font-medium">{formData.location || "Não definida"}</p>
                  </div>
                </div>
                
                {formData.notes && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-sm">{formData.notes}</p>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousStep}>
                Voltar
              </Button>
              <Button onClick={handleCreateInspection} disabled={creating}>
                {creating ? "Criando..." : "Criar Inspeção"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
      
      {/* Help text */}
      <div className="text-sm text-muted-foreground">
        <p>
          Esta inspeção será criada com base no checklist e empresa selecionados. 
          Após criar a inspeção, você poderá preencher respostas para cada item do checklist.
        </p>
      </div>
    </div>
  );
}
