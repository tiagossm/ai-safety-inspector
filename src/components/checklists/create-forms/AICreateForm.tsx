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

const BasicInfoFields = ({
  form,
  setForm,
  users,
  loadingUsers,
  companies,
  loadingCompanies,
}: Pick<AICreateFormProps, 'form' | 'setForm' | 'users' | 'loadingUsers' | 'companies' | 'loadingCompanies'>) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleCompanySelect = (companyId: string, companyData: any) => {
    console.log("Company selected:", companyData);
    setForm({ 
      ...form, 
      company_id: companyId 
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Título será gerado automaticamente a partir do prompt"
            name="title"
            value={form.title || ""}
            onChange={handleInputChange}
          />
          <p className="text-sm text-muted-foreground">
            Opcional. Se não preenchido, será gerado do prompt.
          </p>
        </div>
      </div>

      <div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={form.category || "general"}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Geral</SelectItem>
              <SelectItem value="safety">Segurança</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="operational">Operacional</SelectItem>
              <SelectItem value="quality">Qualidade</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Opcional. Ajuda a organizar seus checklists.
          </p>
        </div>
      </div>

      <div>
        <div className="space-y-2">
          <Label htmlFor="company_id">Empresa</Label>
          <CompanySelector
            value={form.company_id?.toString() || ""}
            onSelect={handleCompanySelect}
          />
          <p className="text-sm text-muted-foreground">
            Selecione uma empresa para gerar um checklist específico para ela.
          </p>
        </div>
      </div>

      <div>
        <div className="space-y-2">
          <Label htmlFor="responsible_id">Responsável</Label>
          {loadingUsers ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={form.responsible_id?.toString() || "none"}
              onValueChange={(value) => handleSelectChange("responsible_id", value === "none" ? "" : value)}
            >
              <SelectTrigger id="responsible_id">
                <SelectValue placeholder="Selecione um responsável (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum responsável</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-sm text-muted-foreground">
            Opcional. Define quem é responsável por este checklist.
          </p>
        </div>
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
  const [companyData, setCompanyData] = useState<any>(null);

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
      
      setCompanyData(data);
      
      if (data) {
        const riskGrade = data.metadata?.risk_grade || "médio";
        const employeeCount = data.employee_count || "não informado";
        const activity = data.metadata?.main_activity || "não informada";
        
        const newPrompt = `Crie um checklist para a empresa ${data.fantasy_name || 'Empresa'}, com CNAE ${data.cnae || 'não informado'}, atividade ${activity}, grau de risco ${riskGrade}, ${employeeCount} funcionários.`;
        
        setGeneratedPrompt(newPrompt);
        props.setAiPrompt(newPrompt);
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  const regeneratePrompt = () => {
    if (companyData) {
      const riskGrade = companyData.metadata?.risk_grade || "médio";
      const employeeCount = companyData.employee_count || "não informado";
      const activity = companyData.metadata?.main_activity || "não informada";
      
      const newPrompt = `Crie um checklist para a empresa ${companyData.fantasy_name || 'Empresa'}, com CNAE ${companyData.cnae || 'não informado'}, atividade ${activity}, grau de risco ${riskGrade}, ${employeeCount} funcionários.`;
      
      setGeneratedPrompt(newPrompt);
      props.setAiPrompt(newPrompt);
    }
  };

  return (
    <div className="space-y-6">
      <BasicInfoFields 
        form={props.form}
        setForm={props.setForm}
        users={props.users}
        loadingUsers={props.loadingUsers}
        companies={props.companies}
        loadingCompanies={props.loadingCompanies}
      />

      <Card className="border rounded-md p-4 bg-slate-50">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-medium">Configurações de Geração por IA</h3>
        </div>
        
        <div className="space-y-4">
          <OpenAIAssistantSelector
            selectedAssistant={props.openAIAssistant}
            setSelectedAssistant={props.setOpenAIAssistant}
          />
          
          <div>
            <Label htmlFor="num-questions">Número de Perguntas: {props.numQuestions}</Label>
            <Slider 
              id="num-questions"
              defaultValue={[props.numQuestions]} 
              min={5} 
              max={50} 
              step={1}
              onValueChange={(values) => props.setNumQuestions(values[0])}
              className="my-4"
            />
            <p className="text-sm text-muted-foreground">
              Defina quantas perguntas você deseja que a IA gere.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt">Descreva o que você deseja verificar</Label>
              {companyData && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={regeneratePrompt}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerar prompt</span>
                </Button>
              )}
            </div>
            <Textarea
              id="prompt"
              placeholder="Ex: Crie um checklist para inspeção de segurança em um canteiro de obras"
              value={props.aiPrompt}
              onChange={(e) => props.setAiPrompt(e.target.value)}
              rows={5}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Seja específico e inclua detalhes relevantes para obter melhores resultados.
            </p>
          </div>
          
          <Button
            type="button"
            onClick={props.onGenerateAI}
            disabled={props.aiLoading || !props.aiPrompt.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {props.aiLoading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Gerar Checklist com IA
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
