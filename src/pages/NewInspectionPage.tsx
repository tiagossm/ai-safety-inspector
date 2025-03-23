
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardCheck, Plus, CalendarIcon, MapPin, User, Building, FileText } from "lucide-react";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { supabase } from "@/integrations/supabase/client";
import { exportChecklistToPDF, exportChecklistToCSV } from "@/utils/pdfExport";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define the type for approval_status to match what's expected in the database
type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

// Define the form schema for inspection creation
const inspectionFormSchema = z.object({
  company_id: z.string().uuid().optional(),
  unit_id: z.string().uuid().optional(),
  cnae: z.string().min(1, { message: "CNAE é obrigatório" }),
  responsible_id: z.string().optional(),
  responsible_name: z.string().optional(),
  responsible_role: z.string().optional(),
  responsible_company: z.string().optional(),
  responsible_document: z.string().optional(),
  scheduled_date: z.date().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  inspection_type: z.enum(["internal", "external", "recurring"]).default("internal"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
}).refine(data => data.company_id || data.unit_id, {
  message: "Selecione uma empresa ou unidade",
  path: ["company_id"]
}).refine(data => data.responsible_id || data.responsible_name, {
  message: "Informe um responsável",
  path: ["responsible_name"]
});

type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

export default function NewInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: checklist, isLoading, error } = useChecklistById(id || "");
  const [isStarting, setIsStarting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Initialize the form with default values
  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      inspection_type: "internal",
      priority: "medium"
    }
  });

  // Get form state for validation and disabling the submit button
  const { formState: { errors, isValid }, watch } = form;
  const formValues = watch();

  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar checklist. Verifique o ID ou tente novamente.");
      navigate("/new-checklists");
    }
  }, [error, navigate]);

  // Load units when company is selected
  useEffect(() => {
    if (formValues.company_id) {
      fetchUnits(formValues.company_id);
    }
  }, [formValues.company_id]);

  // Fetch units for the selected company
  const fetchUnits = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("company_id", companyId);
      
      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Erro ao carregar unidades da empresa");
    }
  };

  // Handle company selection and auto-populate fields
  const handleCompanyChange = async (companyId: string, companyData: any) => {
    form.setValue("company_id", companyId);
    
    // Auto-populate CNAE
    if (companyData?.cnae) {
      form.setValue("cnae", companyData.cnae);
    }
    
    // Auto-populate location from address
    if (companyData?.address) {
      form.setValue("location", companyData.address);
    }
    
    // Fetch units for this company
    await fetchUnits(companyId);
  };

  // Handle unit selection
  const handleUnitChange = (unitId: string, unitData: any) => {
    form.setValue("unit_id", unitId);
    
    // Auto-populate CNAE from unit
    if (unitData?.cnae) {
      form.setValue("cnae", unitData.cnae);
    }
    
    // Auto-populate location from unit address
    if (unitData?.address) {
      form.setValue("location", unitData.address);
    }
  };

  // Handle responsible person selection
  const handleResponsibleChange = (userId: string, userData: any) => {
    form.setValue("responsible_id", userId);
    form.setValue("responsible_name", userData?.name || "");
    form.setValue("responsible_role", userData?.position || "");
  };

  const handleStartInspection = async (values: InspectionFormValues) => {
    if (!checklist || isStarting) return;
    
    setIsStarting(true);
    setValidationError(null);
    
    try {
      console.log("Starting inspection for checklist:", checklist.id);
      console.log("Form values:", values);
      
      // Get the current user to ensure we have a valid user_id
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Erro ao obter dados do usuário: ${userError.message}`);
      }
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado. Faça login para iniciar uma inspeção.");
      }
      
      // Create inspection metadata object
      const inspectionMetadata = {
        responsible_name: values.responsible_name,
        responsible_role: values.responsible_role,
        responsible_company: values.responsible_company,
        responsible_document: values.responsible_document,
        inspection_type: values.inspection_type,
        priority: values.priority,
        scheduled_date: values.scheduled_date ? values.scheduled_date.toISOString() : null,
        location: values.location,
        notes: values.notes
      };
      
      // Create a new inspection record with all required fields
      const inspectionData = {
        checklist_id: checklist.id,
        user_id: userData.user.id,
        status: "Pendente",
        checklist: {
          title: checklist.title,
          description: checklist.description,
          total_questions: checklist.totalQuestions || 0
        },
        cnae: values.cnae, // Use the validated CNAE from form
        approval_status: "pending" as ApprovalStatus, // Explicitly cast to the enum type
        company_id: values.company_id || null,
        unit_id: values.unit_id || null,
        responsible_id: values.responsible_id || null,
        metadata: inspectionMetadata
      };
      
      console.log("Creating inspection with data:", inspectionData);
      
      const { data, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select("id")
        .single();

      if (error) {
        console.error("Detailed error from Supabase:", error);
        setValidationError(`Erro ao iniciar inspeção: ${error.message || "Erro desconhecido"}`);
        throw error;
      }

      if (data) {
        console.log("Inspection created successfully:", data);
        toast.success("Inspeção iniciada com sucesso!");
        // Navigate to the inspection details page or back to checklists
        navigate("/new-checklists");
      }
    } catch (error: any) {
      console.error("Error starting inspection:", error);
      toast.error(`Erro ao iniciar inspeção: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!checklist) return;
    try {
      toast.info("Exportando para PDF...");
      await exportChecklistToPDF(checklist);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error("PDF export error:", error);
    }
  };

  const handleExportCSV = () => {
    if (!checklist) return;
    try {
      toast.info("Exportando para CSV...");
      exportChecklistToCSV(checklist);
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
      console.error("CSV export error:", error);
    }
  };

  // Calculate if the form is valid enough to enable the submit button
  const isFormValid = () => {
    const hasCNAE = !!formValues.cnae;
    const hasCompany = !!formValues.company_id;
    const hasResponsible = !!formValues.responsible_id || !!formValues.responsible_name;
    
    return hasCNAE && hasCompany && hasResponsible && !isStarting;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Checklist não encontrado</h2>
        <Button variant="outline" onClick={() => navigate("/new-checklists")}>
          Voltar para Checklists
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/new-checklists")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Iniciar Nova Inspeção</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Inspeção</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="company">Empresa e Local</TabsTrigger>
                  <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
                </TabsList>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleStartInspection)} className="space-y-6">
                    <TabsContent value="basic" className="space-y-4">
                      {/* Responsible for inspection */}
                      <FormField
                        control={form.control}
                        name="responsible_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável pela Inspeção</FormLabel>
                            <FormControl>
                              <ResponsibleSelector 
                                onSelect={handleResponsibleChange}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              Selecione um usuário do sistema ou informe um responsável externo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* If no responsible_id selected, show manual fields */}
                      {!formValues.responsible_id && (
                        <div className="space-y-4 p-4 border rounded-md bg-slate-50">
                          <FormField
                            control={form.control}
                            name="responsible_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Responsável</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome completo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="responsible_role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cargo/Função</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Cargo ou função" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="responsible_company"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Empresa/Organização</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Empresa ou organização" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="responsible_document"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Documento (opcional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="CPF, registro profissional, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {/* Scheduled date */}
                      <FormField
                        control={form.control}
                        name="scheduled_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data e Hora Planejada</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP 'às' HH:mm", {
                                        locale: pt,
                                      })
                                    ) : (
                                      <span>Selecione a data e hora</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Data e hora para realização da inspeção
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Inspection type */}
                      <FormField
                        control={form.control}
                        name="inspection_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Inspeção</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de inspeção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="internal">Inspeção Interna</SelectItem>
                                <SelectItem value="external">Auditoria Externa</SelectItem>
                                <SelectItem value="recurring">Inspeção Recorrente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Define o propósito e contexto da inspeção
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Priority */}
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Define a prioridade desta inspeção
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Notes */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Instruções ou contexto da inspeção"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Informações adicionais sobre esta inspeção
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="company" className="space-y-4">
                      {/* Company selection */}
                      <FormField
                        control={form.control}
                        name="company_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa</FormLabel>
                            <FormControl>
                              <CompanySelector
                                value={field.value}
                                onSelect={handleCompanyChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Selecione a empresa onde será realizada a inspeção
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Unit selection, only show if company is selected */}
                      {formValues.company_id && units.length > 0 && (
                        <FormField
                          control={form.control}
                          name="unit_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidade</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  const unitData = units.find(u => u.id === value);
                                  handleUnitChange(value, unitData);
                                }} 
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a unidade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {units.map(unit => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                      {unit.fantasy_name || `Unidade ${unit.unit_type}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Selecione a unidade específica para esta inspeção
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* CNAE field */}
                      <FormField
                        control={form.control}
                        name="cnae"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNAE</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="00.00-0" />
                            </FormControl>
                            <FormDescription>
                              Código CNAE da atividade (formato: 00.00-0)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Location field */}
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <Input {...field} placeholder="Endereço completo" className="flex-1" />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  className="ml-2"
                                  onClick={() => {
                                    // Placeholder for GPS capture
                                    toast.info("Captura de GPS não implementada");
                                  }}
                                >
                                  <MapPin className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Local onde será realizada a inspeção
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4">
                      <div className="border rounded-md p-4 bg-slate-50">
                        <h3 className="text-sm font-medium mb-2">Informações do Checklist</h3>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Título:</p>
                              <p className="text-sm font-medium">{checklist.title}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Categoria:</p>
                              <p className="text-sm font-medium">{checklist.category || "Não especificada"}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Descrição:</p>
                            <p className="text-sm">{checklist.description || "Sem descrição"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total de perguntas:</p>
                            <p className="text-sm font-medium">{checklist.totalQuestions || 0}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Display validation errors */}
                      {validationError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Erro</AlertTitle>
                          <AlertDescription>
                            {validationError}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button variant="outline" onClick={handleExportPDF}>
                          Exportar como PDF
                        </Button>
                        <Button variant="outline" onClick={handleExportCSV}>
                          Exportar como CSV
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <div className="pt-6">
                      <Button 
                        type="submit"
                        disabled={!isFormValid()}
                        className="bg-teal-600 hover:bg-teal-700 w-full"
                      >
                        <ClipboardCheck className="h-5 w-5 mr-2" />
                        {isStarting ? "Iniciando..." : "Iniciar Inspeção Agora"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Inspeção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Checklist:</span>
                  <span className="ml-1 font-medium">{checklist.title}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Empresa:</span>
                  <span className="ml-1 font-medium">
                    {formValues.company_id ? "Selecionada" : "Não selecionada"}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Responsável:</span>
                  <span className="ml-1 font-medium">
                    {formValues.responsible_id || formValues.responsible_name ? "Definido" : "Não definido"}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Data:</span>
                  <span className="ml-1 font-medium">
                    {formValues.scheduled_date ? 
                      format(formValues.scheduled_date, "dd/MM/yyyy", { locale: pt }) : 
                      "Não agendada"}
                  </span>
                </div>
                
                {formValues.inspection_type && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-1 font-medium">
                      {formValues.inspection_type === "internal" ? "Inspeção Interna" :
                       formValues.inspection_type === "external" ? "Auditoria Externa" : 
                       "Inspeção Recorrente"}
                    </span>
                  </div>
                )}
                
                {formValues.priority && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">Prioridade:</span>
                    <span className="ml-1 font-medium">
                      {formValues.priority === "low" ? "Baixa" :
                       formValues.priority === "medium" ? "Média" : "Alta"}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Validation summary */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-2">Validação</h3>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${formValues.company_id ? "bg-green-500" : "bg-red-500"}`} />
                    <span>Empresa selecionada</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${formValues.cnae ? "bg-green-500" : "bg-red-500"}`} />
                    <span>CNAE informado</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${formValues.responsible_id || formValues.responsible_name ? "bg-green-500" : "bg-red-500"}`} />
                    <span>Responsável definido</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
