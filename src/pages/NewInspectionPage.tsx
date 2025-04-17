
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { Database } from "@/integrations/supabase/types";

// Define tipos necessários
type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

const NewInspectionPage = () => {
  const { id: checklistId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados do formulário
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        console.log(`Buscando checklist com ID: ${checklistId}`);
        
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

        console.log(`Checklist carregado: ${data.title} com ${data.checklist_itens?.length || 0} perguntas`);
        setChecklist(data);

        // Se o checklist estiver associado a uma empresa, carregue os dados da empresa
        if (data.company_id) {
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
      } catch (error: any) {
        console.error("Erro ao carregar checklist:", error);
        toast.error(`Erro ao carregar o checklist: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [checklistId, navigate]);

  // Atualiza a localização com o endereço da empresa quando este muda
  useEffect(() => {
    if (companyData?.address) {
      setLocation(companyData.address);
    }
  }, [companyData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!companyId) newErrors.company = "Selecione uma empresa";
    if (!companyData?.cnae) newErrors.cnae = "CNAE é obrigatório";
    else if (!/^\d{2}\.\d{2}-\d$/.test(companyData.cnae)) newErrors.cnae = "CNAE deve estar no formato 00.00-0";
    if (!responsibleId && !responsibleData) newErrors.responsible = "Selecione um responsável";
    if (!checklistId || !/^[0-9a-f\-]{36}$/i.test(checklistId)) newErrors.checklist = "ID do checklist inválido";
    if (companyId && !/^[0-9a-f\-]{36}$/i.test(companyId)) newErrors.company = "ID da empresa inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return companyId && companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(companyData.cnae);
  };

  const formatCNAE = (cnae: string) => {
    const numericOnly = cnae.replace(/[^\d]/g, '');
    if (numericOnly.length >= 5) {
      return `${numericOnly.substring(0, 2)}.${numericOnly.substring(2, 4)}-${numericOnly.substring(4, 5)}`;
    }
    return cnae;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user?.id) {
        toast.error("Usuário não autenticado");
        return;
      }

      const formattedCNAE = formatCNAE(companyData.cnae);
      const formattedDate = scheduledDate ? scheduledDate.toISOString() : null;

      console.log(`Criando inspeção para checklist ${checklistId} com ${checklist?.checklist_itens?.length || 0} perguntas`);

      const inspectionData = {
        checklist_id: checklistId,
        user_id: user.id,
        company_id: companyId,
        cnae: formattedCNAE,
        status: "pending",
        approval_status: "pending" as ApprovalStatus,
        responsible_id: responsibleId || null,
        scheduled_date: formattedDate,
        location: location || "",
        inspection_type: inspectionType || "internal",
        priority: priority || "medium",
        metadata: {
          notes: notes || "",
          responsible_data: responsibleId ? null : responsibleData,
        },
        checklist: {
          title: checklist.title,
          description: checklist.description || "",
          total_questions: Array.isArray(checklist?.checklist_itens) ? checklist.checklist_itens.length : 0
        }
      };

      console.log("Enviando dados da inspeção:", inspectionData);

      const { data: inspection, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Inspeção criada com sucesso!");
      navigate(`/inspections/${inspection.id}/view`);

    } catch (error: any) {
      console.error("Erro ao criar inspeção:", error);
      toast.error(`Erro ao criar inspeção: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompanySelect = (id: string, data: any) => {
    setCompanyId(id);
    setCompanyData(data);
    if (data.address) setLocation(data.address);
    if (data.cnae && /^\d{2}\.\d{2}-\d$/.test(data.cnae)) {
      setErrors(prev => ({ ...prev, cnae: "" }));
    }
  };

  const handleResponsibleSelect = (id: string, data: any) => {
    setResponsibleId(id);
    setResponsibleData(data);
    setErrors(prev => ({ ...prev, responsible: "" }));
  };

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
          {/* Coluna esquerda - Informações do checklist */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Checklist Selecionado</h2>
                <p className="text-sm text-muted-foreground">Detalhes do checklist</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mt-4" />
                  </div>
                ) : checklist ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">{checklist.title}</h3>
                      <p className="text-sm text-gray-500">{checklist.description || "Sem descrição"}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm"><span className="font-medium">Total de perguntas:</span> {checklist.checklist_itens?.length || 0}</p>
                      <p className="text-sm"><span className="font-medium">Categoria:</span> {checklist.category || "Não especificada"}</p>
                      <p className="text-sm"><span className="font-medium">Criado em:</span> {new Date(checklist.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Checklist não encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna direita - Formulário */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Detalhes da Inspeção</h2>
                <p className="text-sm text-muted-foreground">Preencha os dados para iniciar a inspeção</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Empresa */}
                  <div>
                    <Label htmlFor="company">Empresa <span className="text-destructive">*</span></Label>
                    <div className="mt-1.5">
                      <CompanySelector
                        value={companyId}
                        onSelect={handleCompanySelect}
                      />
                      {errors.company && (
                        <p className="text-sm text-destructive mt-1">{errors.company}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* CNAE */}
                  {companyData && (
                    <div>
                      <Label htmlFor="cnae">CNAE <span className="text-destructive">*</span></Label>
                      <Input
                        id="cnae"
                        value={companyData.cnae || ""}
                        onChange={(e) => {
                          setCompanyData({ ...companyData, cnae: e.target.value });
                        }}
                        placeholder="00.00-0"
                        className={`mt-1.5 ${errors.cnae ? "border-destructive" : ""}`}
                      />
                      {errors.cnae && (
                        <p className="text-sm text-destructive mt-1">{errors.cnae}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Responsável */}
                  <div>
                    <Label htmlFor="responsible">Responsável <span className="text-destructive">*</span></Label>
                    <div className="mt-1.5">
                      <ResponsibleSelector
                        value={responsibleId}
                        onSelect={handleResponsibleSelect}
                      />
                      {errors.responsible && (
                        <p className="text-sm text-destructive mt-1">{errors.responsible}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Data agendada */}
                  <div>
                    <Label htmlFor="scheduled_date">Data Agendada</Label>
                    <div className="mt-1.5">
                      <DateTimePicker
                        date={scheduledDate}
                        setDate={setScheduledDate}
                      />
                    </div>
                  </div>
                  
                  {/* Localização */}
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Textarea
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Endereço completo do local da inspeção"
                      rows={2}
                      className="mt-1.5"
                    />
                  </div>
                  
                  {/* Observações */}
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observações adicionais sobre a inspeção"
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                  
                  {/* Tipo de inspeção e prioridade */}
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
