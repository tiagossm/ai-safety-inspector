
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
import { Slider } from "@/components/ui/slider";
import { CompanyListItem } from "@/types/CompanyListItem";
import { AIAssistantType } from "@/hooks/checklist/useChecklistCreation";
import { Bot, Sparkles, BrainCircuit, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { useOpenAIAssistants } from "@/hooks/useOpenAIAssistants";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Company, CompanyMetadata } from "@/types/company";

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
  selectedAssistant: AIAssistantType;
  setSelectedAssistant: React.Dispatch<React.SetStateAction<AIAssistantType>>;
  openAIAssistant: string;
  setOpenAIAssistant: React.Dispatch<React.SetStateAction<string>>;
  assistants: any[];
  loadingAssistants: boolean;
}

// Componente para selecionar o tipo de assistente
const AssistantTypeSelector = ({ 
  selectedType, 
  onChange 
}: { 
  selectedType: AIAssistantType;
  onChange: (type: AIAssistantType) => void;
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Selecione o tipo de assistente</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card 
          className={`p-4 cursor-pointer transition-all ${selectedType === 'general' ? 'border-teal-500 ring-1 ring-teal-500' : 'hover:border-muted-foreground'}`}
          onClick={() => onChange('general')}
        >
          <div className="flex flex-col items-center text-center gap-2 p-2">
            <div className="mb-2">
              <input
                type="radio"
                checked={selectedType === 'general'}
                onChange={() => onChange('general')}
                className="sr-only"
                id="assistant-general"
              />
              <div className={`w-5 h-5 rounded-full border ${selectedType === 'general' ? 'bg-teal-500 border-teal-600' : 'border-gray-400'}`}>
                {selectedType === 'general' && <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1"></div>}
              </div>
            </div>
            <label htmlFor="assistant-general" className="font-medium">Geral</label>
            <p className="text-xs text-muted-foreground">
              Checklists para uso geral e diversos propósitos
            </p>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer transition-all ${selectedType === 'workplace-safety' ? 'border-teal-500 ring-1 ring-teal-500' : 'hover:border-muted-foreground'}`}
          onClick={() => onChange('workplace-safety')}
        >
          <div className="flex flex-col items-center text-center gap-2 p-2">
            <div className="mb-2">
              <input
                type="radio"
                checked={selectedType === 'workplace-safety'}
                onChange={() => onChange('workplace-safety')}
                className="sr-only"
                id="assistant-safety"
              />
              <div className={`w-5 h-5 rounded-full border ${selectedType === 'workplace-safety' ? 'bg-teal-500 border-teal-600' : 'border-gray-400'}`}>
                {selectedType === 'workplace-safety' && <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1"></div>}
              </div>
            </div>
            <label htmlFor="assistant-safety" className="font-medium">Segurança</label>
            <p className="text-xs text-muted-foreground">
              Segurança do trabalho, prevenção de acidentes
            </p>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer transition-all ${selectedType === 'compliance' ? 'border-teal-500 ring-1 ring-teal-500' : 'hover:border-muted-foreground'}`}
          onClick={() => onChange('compliance')}
        >
          <div className="flex flex-col items-center text-center gap-2 p-2">
            <div className="mb-2">
              <input
                type="radio"
                checked={selectedType === 'compliance'}
                onChange={() => onChange('compliance')}
                className="sr-only"
                id="assistant-compliance"
              />
              <div className={`w-5 h-5 rounded-full border ${selectedType === 'compliance' ? 'bg-teal-500 border-teal-600' : 'border-gray-400'}`}>
                {selectedType === 'compliance' && <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1"></div>}
              </div>
            </div>
            <label htmlFor="assistant-compliance" className="font-medium">Conformidade</label>
            <p className="text-xs text-muted-foreground">
              Auditorias, normas e requisitos regulatórios
            </p>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer transition-all ${selectedType === 'quality' ? 'border-teal-500 ring-1 ring-teal-500' : 'hover:border-muted-foreground'}`}
          onClick={() => onChange('quality')}
        >
          <div className="flex flex-col items-center text-center gap-2 p-2">
            <div className="mb-2">
              <input
                type="radio"
                checked={selectedType === 'quality'}
                onChange={() => onChange('quality')}
                className="sr-only"
                id="assistant-quality"
              />
              <div className={`w-5 h-5 rounded-full border ${selectedType === 'quality' ? 'bg-teal-500 border-teal-600' : 'border-gray-400'}`}>
                {selectedType === 'quality' && <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1"></div>}
              </div>
            </div>
            <label htmlFor="assistant-quality" className="font-medium">Qualidade</label>
            <p className="text-xs text-muted-foreground">
              Controle de qualidade e processos
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

function OpenAIAssistantSelector({ 
  selectedAssistant, 
  setSelectedAssistant 
}: { 
  selectedAssistant: string,
  setSelectedAssistant: (value: string) => void 
}) {
  const { assistants, loading, error } = useOpenAIAssistants();

  if (loading) {
    return <Skeleton className="h-9 w-full" />;
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        <p>Erro ao carregar assistentes: {error}</p>
        <p>Verifique se a chave da API da OpenAI está configurada corretamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="openai-assistant">Assistente de IA</Label>
      <Select
        value={selectedAssistant || "default"}
        onValueChange={setSelectedAssistant}
      >
        <SelectTrigger id="openai-assistant">
          <SelectValue placeholder="Selecione um assistente da OpenAI" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Assistente padrão</SelectItem>
          {assistants.map((assistant) => (
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
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Escolha um assistente especializado para melhorar os resultados.
      </p>
    </div>
  );
}

export function AICreateForm(props: AICreateFormProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  useEffect(() => {
    if (props.form.company_id) {
      fetchCompanyData(props.form.company_id.toString());
    }
  }, [props.form.company_id]);

  const fetchCompanyData = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      
      // Convert the Supabase data to the Company type
      const companyData: Company = {
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
      
      setCompanyData(companyData);
      
      if (companyData) {
        // Safely access metadata properties with proper type checking
        const metadata = companyData.metadata as CompanyMetadata | null;
        const riskGrade = metadata?.risk_grade || "médio";
        const employeeCount = companyData.employee_count || "não informado";
        const activity = metadata?.main_activity || "não informada";
        
        const newPrompt = `Crie um checklist para a empresa ${companyData.fantasy_name || 'Empresa'}, com CNAE ${companyData.cnae || 'não informado'}, atividade ${activity}, grau de risco ${riskGrade}, ${employeeCount} funcionários.`;
        
        setGeneratedPrompt(newPrompt);
        props.setAiPrompt(newPrompt);
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  const regeneratePrompt = () => {
    if (companyData) {
      // Safely access metadata properties with proper type checking
      const metadata = companyData.metadata as CompanyMetadata | null;
      const riskGrade = metadata?.risk_grade || "médio";
      const employeeCount = companyData.employee_count || "não informado";
      const activity = metadata?.main_activity || "não informada";
      
      const newPrompt = `Crie um checklist para a empresa ${companyData.fantasy_name || 'Empresa'}, com CNAE ${companyData.cnae || 'não informado'}, atividade ${activity}, grau de risco ${riskGrade}, ${employeeCount} funcionários.`;
      
      setGeneratedPrompt(newPrompt);
      props.setAiPrompt(newPrompt);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mt-4 mb-8">
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-lg font-medium">Prompt para gerar o checklist *</Label>
            <Textarea
              id="prompt"
              placeholder="Descreva o checklist que você deseja gerar. Ex: Checklist para inspeção de segurança em um canteiro de obras..."
              value={props.aiPrompt}
              onChange={(e) => props.setAiPrompt(e.target.value)}
              rows={5}
              className="w-full text-base"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="num-questions" className="flex justify-between">
                    <span>Número de Perguntas</span>
                    <span className="font-medium">{props.numQuestions}</span>
                  </Label>
                  <Slider 
                    id="num-questions"
                    value={[props.numQuestions]} 
                    min={5} 
                    max={50} 
                    step={1}
                    onValueChange={(values) => props.setNumQuestions(values[0])}
                    className="my-4"
                  />
                </div>
                
                <AssistantTypeSelector 
                  selectedType={props.selectedAssistant} 
                  onChange={props.setSelectedAssistant}
                />
                
                <Button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  variant="outline"
                  className="w-full"
                >
                  {showAdvancedOptions ? "Ocultar opções avançadas" : "Mostrar opções avançadas"}
                </Button>
                
                {showAdvancedOptions && (
                  <div className="space-y-4 border-t pt-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_id">Empresa</Label>
                      <CompanySelector
                        value={props.form.company_id?.toString() || ""}
                        onSelect={(companyId, companyData) => {
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
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-slate-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Como funciona</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Nosso assistente de IA irá gerar um checklist com base na sua descrição. 
                  Quanto mais detalhado for o prompt, melhores serão os resultados.
                </p>
                
                <h4 className="font-medium text-sm mt-4 mb-2">Exemplos de prompts:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>"Checklist para inspeção de segurança em andaimes"</li>
                  <li>"Lista de verificação para manutenção preventiva de empilhadeiras"</li>
                  <li>"Auditoria de conformidade para normas de proteção contra incêndio"</li>
                </ul>
                
                <div className="mt-4 border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Você poderá revisar e editar o checklist gerado antes de salvá-lo.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={props.onGenerateAI}
            disabled={props.aiLoading || !props.aiPrompt.trim()}
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
