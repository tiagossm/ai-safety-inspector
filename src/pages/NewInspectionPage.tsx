
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { ArrowLeft, CalendarIcon, Building, User, MapPin, ClipboardList, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/integrations/supabase/types";

// Define ApprovalStatus type from Database Enums
type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

const NewInspectionPage = () => {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [companyId, setCompanyId] = useState<string>("");
  const [companyData, setCompanyData] = useState<any>(null);
  const [responsibleId, setResponsibleId] = useState<string>("");
  const [responsibleData, setResponsibleData] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [inspectionType, setInspectionType] = useState<string>("internal");
  const [priority, setPriority] = useState<string>("medium");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!checklistId) {
      toast.error("ID do checklist não fornecido");
      navigate("/inspections");
      return;
    }
    
    const fetchChecklist = async () => {
      try {
        setLoading(true);
        console.log("Fetching checklist with ID:", checklistId);
        
        const { data, error } = await supabase
          .from("checklists")
          .select("*, checklist_itens(*)")
          .eq("id", checklistId)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          toast.error("Checklist não encontrado");
          navigate("/inspections");
          return;
        }
        
        setChecklist(data);
        
        // If checklist already has a company_id, pre-select it
        if (data.company_id) {
          // Fetch company data to populate fields
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", data.company_id)
            .single();
          
          if (!companyError && companyData) {
            setCompanyId(companyData.id);
            setCompanyData(companyData);
            setLocation(companyData.address || "");
          }
        }
        
      } catch (error) {
        console.error("Error fetching checklist:", error);
        toast.error("Erro ao carregar o checklist");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChecklist();
  }, [checklistId, navigate]);
  
  // Update location when company is selected
  useEffect(() => {
    if (companyData && companyData.address) {
      setLocation(companyData.address);
    }
  }, [companyData]);
  
  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!companyId) {
      newErrors.company = "Selecione uma empresa";
    }
    
    if (!companyData?.cnae) {
      newErrors.cnae = "CNAE é obrigatório";
    } else if (!/^\d{2}\.\d{2}-\d$/.test(companyData.cnae)) {
      newErrors.cnae = "CNAE deve estar no formato 00.00-0";
    }
    
    if (!responsibleId && !responsibleData) {
      newErrors.responsible = "Selecione um responsável";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle company selection
  const handleCompanySelect = (id: string, data: any) => {
    setCompanyId(id);
    setCompanyData(data);
    if (data.address) {
      setLocation(data.address);
    }
    
    // Clear CNAE error if valid
    if (data.cnae && /^\d{2}\.\d{2}-\d$/.test(data.cnae)) {
      setErrors(prev => ({...prev, cnae: ""}));
    }
  };
  
  // Handle responsible selection
  const handleResponsibleSelect = (id: string, data: any) => {
    setResponsibleId(id);
    setResponsibleData(data);
    setErrors(prev => ({...prev, responsible: ""}));
  };
  
  // Check if form is valid
  const isFormValid = () => {
    return companyId && companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(companyData.cnae);
  };
  
  // Format CNAE to expected format
  const formatCNAE = (cnae: string) => {
    // Remove non-numeric characters
    const numericOnly = cnae.replace(/[^\d]/g, '');
    
    // Format to XX.XX-X
    if (numericOnly.length >= 5) {
      return `${numericOnly.substring(0, 2)}.${numericOnly.substring(2, 4)}-${numericOnly.substring(4, 5)}`;
    }
    
    return cnae; // Return original if cannot format
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format CNAE properly
      const formattedCNAE = formatCNAE(companyData.cnae);
      console.log("Using formatted CNAE:", formattedCNAE);
      
      // Prepare the inspection data
      const inspectionData = {
        checklist_id: checklistId,
        user_id: user.id,
        company_id: companyId,
        cnae: formattedCNAE,
        status: "Pendente",
        approval_status: "pending" as ApprovalStatus,
        responsible_id: responsibleId || null,
        scheduled_date: scheduledDate ? scheduledDate.toISOString() : null,
        location: location || null,
        inspection_type: inspectionType || null,
        priority: priority || null,
        metadata: {
          notes: notes || null,
          responsible_data: responsibleId ? null : responsibleData,
        },
        checklist: {
          title: checklist.title,
          description: checklist.description,
          total_questions: checklist?.checklist_itens?.length || 0,
        }
      };
      
      console.log("Sending inspection data:", inspectionData);
      
      // Create inspection
      const { data: inspection, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast.success("Inspeção criada com sucesso!");
      navigate(`/inspections/${inspection.id}`);
      
    } catch (error: any) {
      console.error("Error creating inspection:", error);
      toast.error(`Erro ao criar inspeção: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/inspections")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Nova Inspeção</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Checklist info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Checklist Selecionado</CardTitle>
                <CardDescription>
                  Detalhes do checklist a ser utilizado na inspeção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Título</Label>
                    <div className="font-medium mt-1">{checklist?.title}</div>
                  </div>
                  
                  <div>
                    <Label>Descrição</Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {checklist?.description || "Sem descrição"}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Número de Perguntas</Label>
                    <div className="font-medium mt-1">
                      {checklist?.checklist_itens?.length || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Form fields */}
          <div className="md:col-span-2">
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
                      onSelect={handleCompanySelect}
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
                
                <Separator />
                
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
                  onClick={() => navigate("/inspections")}
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewInspectionPage;
