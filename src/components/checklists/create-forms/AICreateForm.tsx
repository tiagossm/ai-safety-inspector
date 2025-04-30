
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
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { supabase } from "@/integrations/supabase/client";
import { Company, CompanyMetadata } from "@/types/company";
import { toast } from "sonner";
import { OpenAIAssistantSelector } from "@/components/ai/OpenAIAssistantSelector";
import QuestionCountSelector from "./QuestionCountSelector";

interface AICreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  companies: any[];
  loadingCompanies: boolean;
  aiPrompt: string;
  setAiPrompt: React.Dispatch<React.SetStateAction<string>>;
  numQuestions: number;
  setNumQuestions: React.Dispatch<React.SetStateAction<number>>;
  onGenerateAI: (attachedFile?: File | null) => void;
  aiLoading: boolean;
  selectedAssistant: string;
  setSelectedAssistant: React.Dispatch<React.SetStateAction<string>>;
  openAIAssistant: string;
  setOpenAIAssistant: React.Dispatch<React.SetStateAction<string>>;
  assistants: any[];
  loadingAssistants: boolean;
}

export function AICreateFormContent(props: AICreateFormProps) {
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [formattedPrompt, setFormattedPrompt] = useState<string>("");
  const [contextType, setContextType] = useState<string>("Setor");
  const [contextValue, setContextValue] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [companyError, setCompanyError] = useState<string>("");
  const maxDescriptionLength = 500;
  const minDescriptionLength = 5;

  useEffect(() => {
    if (props.form.company_id) {
      fetchCompanyData(props.form.company_id.toString());
    } else {
      setCompanyData(null);
      updateFormattedPrompt(null, props.form.category || "", description);
    }
  }, [props.form.company_id, props.form.category, contextType, contextValue, description]);

  const fetchCompanyData = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .eq('status', 'active')
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        setCompanyError("Empresa não encontrada ou inativa");
        setCompanyData(null);
        return;
      }
      
      setCompanyError("");
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
      updateFormattedPrompt(company, props.form.category || "", description);
    } catch (error) {
      console.error("Error fetching company data:", error);
      setCompanyError("Erro ao carregar dados da empresa");
      toast.error("Erro ao carregar dados da empresa");
    }
  };

  const updateFormattedPrompt = (company: Company | null, category: string, desc: string) => {
    const metadata = company?.metadata || null;
    const riskGrade = metadata?.risk_grade || "não informado";
    const employeeCount = company?.employee_count || "não informado";
    const context = contextType && contextValue ? `${contextType}: ${contextValue}` : "";

    const prompt = `Categoria: ${category || "Não especificada"}
Empresa: ${company?.fantasy_name || 'Empresa'} (CNPJ ${company?.cnpj || 'não informado'}, CNAE ${company?.cnae || 'não informado'}, Grau de Risco ${riskGrade}, Funcionários: ${employeeCount})
Descrição: ${desc}
Contexto: ${context}`;

    setFormattedPrompt(prompt);
    props.setAiPrompt(prompt);

    // Também atualiza a descrição no formulário
    props.setForm({
      ...props.form,
      description: desc
    });
  };

  const handleGenerateClick = () => {
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

    if (!description || description.length < minDescriptionLength) {
      toast.error(`Por favor, forneça uma descrição com pelo menos ${minDescriptionLength} caracteres`);
      return;
    }
    
    props.onGenerateAI(null);
  };

  const isDescriptionValid = description.length >= minDescriptionLength && description.length <= maxDescriptionLength;

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
                  placeholder="Ex: NR-35, Inspeção de Equipamentos"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o propósito deste checklist"
                  className="min-h-[80px]"
                  maxLength={maxDescriptionLength}
                  required
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className={`${!isDescriptionValid && description.length > 0 ? "text-red-500" : ""}`}>
                    Mínimo: {minDescriptionLength} caracteres
                  </span>
                  <span className={`${description.length > maxDescriptionLength ? "text-red-500" : ""}`}>
                    {description.length}/{maxDescriptionLength} caracteres
                  </span>
                </div>
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
                  error={companyError}
                  showTooltip={true}
                />
              </div>

              <OpenAIAssistantSelector
                selectedAssistant={props.openAIAssistant}
                setSelectedAssistant={props.setOpenAIAssistant}
              />

              <QuestionCountSelector 
                questionCount={props.numQuestions}
                setQuestionCount={props.setNumQuestions}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contextType">Tipo de contexto</Label>
                  <Select
                    value={contextType}
                    onValueChange={setContextType}
                  >
                    <SelectTrigger id="contextType">
                      <SelectValue placeholder="Escolha o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Setor">Setor</SelectItem>
                      <SelectItem value="Cargo">Cargo</SelectItem>
                      <SelectItem value="Atividade">Atividade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contextValue">Valor</Label>
                  <Input
                    id="contextValue"
                    value={contextValue}
                    onChange={(e) => setContextValue(e.target.value)}
                    placeholder="Ex: Almoxarifado"
                  />
                </div>
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
                    onClick={() => updateFormattedPrompt(companyData, props.form.category || "", description)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerar
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap bg-white border rounded-md p-4 text-sm font-mono">
                  {formattedPrompt}
                </pre>
              </Card>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerateClick}
            disabled={
              props.aiLoading || 
              !props.form.category?.trim() || 
              !props.form.company_id || 
              !props.openAIAssistant || 
              !isDescriptionValid
            }
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
