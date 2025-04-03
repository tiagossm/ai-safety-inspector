
import React, { useEffect, useState } from "react";
import { NewChecklist } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CompanyListItem } from "@/types/CompanyListItem";
import { Bot, Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { useOpenAIAssistants } from "@/hooks/useOpenAIAssistants";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Company, CompanyMetadata } from "@/types/company";
import { toast } from "sonner";

interface AICreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
  aiPrompt: string;
  setAiPrompt: React.Dispatch<React.SetStateAction<string>>;
  numQuestions: number;
  setNumQuestions: React.Dispatch<React.SetStateAction<number>>;
  onGenerateAI: () => void;
  aiLoading: boolean;
  selectedAssistant: string;
  setSelectedAssistant: React.Dispatch<React.SetStateAction<string>>;
  openAIAssistant: string;
  setOpenAIAssistant: React.Dispatch<React.SetStateAction<string>>;
  assistants: any[];
  loadingAssistants: boolean;
}

function OpenAIAssistantSelector({ 
  selectedAssistant, 
  setSelectedAssistant,
  required = true
}: { 
  selectedAssistant: string,
  setSelectedAssistant: (value: string) => void,
  required?: boolean
}) {
  const { assistants, loading, error, refreshAssistants } = useOpenAIAssistants();

  if (loading) {
    return <Skeleton className="h-9 w-full" />;
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        <p>Erro ao carregar assistentes: {error}</p>
        <p>Verifique se a chave da API da OpenAI está configurada corretamente.</p>
        <Button variant="outline" size="sm" onClick={refreshAssistants} className="mt-2">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="openai-assistant" className="flex items-center">
        Assistente de IA
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={selectedAssistant || ""}
        onValueChange={setSelectedAssistant}
      >
        <SelectTrigger id="openai-assistant">
          <SelectValue placeholder="Selecione um assistente da OpenAI" />
        </SelectTrigger>
        <SelectContent>
          {assistants.length === 0 ? (
            <SelectItem value="" disabled>Nenhum assistente disponível</SelectItem>
          ) : (
            assistants.map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.id}>
                <div className="flex items-center">
                  {assistant.name}
                  {assistant.model && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {assistant.model}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Escolha um assistente especializado para melhorar os resultados.
      </p>
    </div>
  );
}

export function AICreateFormContent(props: AICreateFormProps) {
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [formattedPrompt, setFormattedPrompt] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Monitor changes to relevant form fields
  useEffect(() => {
    if (props.form.company_id) {
      fetchCompanyData(props.form.company_id.toString());
    } else {
      setCompanyData(null);
      updateFormattedPrompt(null, props.form.category || "", customPrompt);
    }
  }, [props.form.company_id, props.form.category, customPrompt]);

  const fetchCompanyData = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      
      // Convert the Supabase data to the Company type
      const company: Company = {
        id: data.id,
        fantasy_name: data.fantasy_name,
        cnpj: data.cnpj,
        cnae: data.cnae,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        contact_name: data.contact_name,
        employee_count: data.employee_count,
        metadata: data.metadata as CompanyMetadata | null,
        created_at: data.created_at,
        status: data.status as Company['status'],
        deactivated_at: data.deactivated_at,
        address: data.address
      };
      
      setCompanyData(company);
      updateFormattedPrompt(company, props.form.category || "", customPrompt);
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Erro ao carregar dados da empresa");
    }
  };

  const updateFormattedPrompt = (company: Company | null, category: string, description: string) => {
    if (!company) {
      const prompt = `Categoria: ${category || "Não especificada"}\nEmpresa: Não selecionada\nDescrição: ${description || ""}`;
      setFormattedPrompt(prompt);
      props.setAiPrompt(prompt);
      return;
    }

    // Safely access metadata properties with proper type checking
    const metadata = company.metadata as CompanyMetadata | null;
    const riskGrade = metadata?.risk_grade || "não informado";
    const employeeCount = company.employee_count || "não informado";
    
    const prompt = `Categoria: ${category || "Não especificada"}
Empresa: ${company.fantasy_name || 'Empresa'} (CNPJ ${company.cnpj || 'não informado'}, CNAE ${company.cnae || 'não informado'}, Grau de Risco ${riskGrade}, Funcionários: ${employeeCount})
Descrição: ${description || ""}`;
    
    setFormattedPrompt(prompt);
    props.setAiPrompt(prompt);
  };

  const regeneratePrompt = () => {
    updateFormattedPrompt(companyData, props.form.category || "", customPrompt);
    toast.success("Prompt regenerado com sucesso!");
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
  };

  const handleGenerateClick = () => {
    // Validation
    if (!props.form.category?.trim()) {
      toast.error("Por favor, informe a categoria do checklist");
      return;
    }

    if (!props.form.company_id) {
      toast.error("Por favor, selecione uma empresa");
      return;
    }

    if (!props.openAIAssistant) {
      toast.error("Por favor, selecione um assistente de IA");
      return;
    }

    // Proceed with generation
    props.onGenerateAI();
  };

  return (
    <div className="space-y-6">
      <div className="mt-4 mb-8">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoria do Checklist <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category"
                  value={props.form.category || ""}
                  onChange={(e) => props.setForm({ ...props.form, category: e.target.value })}
                  placeholder="Ex: NR-35, Inspeção de Equipamentos, Lista de Suprimentos"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Informe a categoria ou tipo do checklist (ex: NR-35, Inspeção de Equipamentos)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">
                  Empresa <span className="text-red-500">*</span>
                </Label>
                <CompanySelector
                  value={props.form.company_id?.toString() || ""}
                  onSelect={(companyId) => {
                    props.setForm({ 
                      ...props.form, 
                      company_id: companyId 
                    });
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Selecione uma empresa para gerar um checklist específico para ela.
                </p>
              </div>

              <OpenAIAssistantSelector
                selectedAssistant={props.openAIAssistant}
                setSelectedAssistant={props.setOpenAIAssistant}
              />

              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Descreva o checklist que deseja gerar</Label>
                <Textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={handleCustomPromptChange}
                  placeholder="Descreva o que o checklist deve conter, ex: Checklist para verificar EPIs e sinalização de perigos"
                  rows={3}
                />
              </div>
            </div>
            
            <div>
              <Card className="p-6 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Prompt Final</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={regeneratePrompt}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerar
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap bg-white border rounded-md p-4 text-sm font-mono">
                  {formattedPrompt}
                </pre>
                
                <div className="mt-6">
                  <h4 className="font-medium text-sm mt-4 mb-2">Como funciona:</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    A IA combinará as informações da categoria, empresa e sua descrição para gerar um checklist personalizado.
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    Você poderá revisar e editar o checklist gerado antes de salvá-lo.
                  </p>
                </div>
              </Card>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={handleGenerateClick}
            disabled={props.aiLoading || !props.form.category?.trim() || !props.form.company_id || !props.openAIAssistant}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 mt-4"
            size="lg"
          >
            {props.aiLoading ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-5 w-5" />
                Gerar Checklist com IA
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AICreateForm(props: AICreateFormProps) {
  return <AICreateFormContent {...props} />;
}
