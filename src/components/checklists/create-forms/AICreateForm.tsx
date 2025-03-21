
import React, { useState, ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Bot, RefreshCw } from "lucide-react";
import { NewChecklist } from "@/types/checklist";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { AIAssistantSelector } from "./AIAssistantSelector";
import { AIAssistantType } from "@/hooks/new-checklist/useChecklistAI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AICreateFormProps {
  form: NewChecklist;
  setForm: (form: NewChecklist) => void;
  users: any[];
  loadingUsers: boolean;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  numQuestions: number;
  setNumQuestions: (num: number) => void;
  onGenerateAI: () => void;
  aiLoading: boolean;
  companies: any[];
  loadingCompanies: boolean;
  selectedAssistant?: AIAssistantType;
  setSelectedAssistant?: (assistant: AIAssistantType) => void;
  openAIAssistant?: string;
  setOpenAIAssistant?: (id: string) => void;
  assistants?: any[];
  loadingAssistants?: boolean;
}

export function AICreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  aiPrompt,
  setAiPrompt,
  numQuestions,
  setNumQuestions,
  onGenerateAI,
  aiLoading,
  companies,
  loadingCompanies,
  selectedAssistant = "general",
  setSelectedAssistant,
  openAIAssistant = "",
  setOpenAIAssistant,
  assistants = [],
  loadingAssistants = false,
}: AICreateFormProps) {
  const [promptTab, setPromptTab] = useState("free-text");
  const [structuredContext, setStructuredContext] = useState({
    industry: "",
    companySize: "",
    goal: "",
    specificArea: "",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleStructuredInputChange = (field: string, value: string) => {
    setStructuredContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateStructuredPrompt = (): string => {
    const { industry, companySize, goal, specificArea } = structuredContext;
    
    let prompt = `Crie um checklist para uma empresa do setor de ${industry || "qualquer indústria"}`;
    
    if (companySize) {
      prompt += ` com ${companySize} funcionários`;
    }
    
    if (goal) {
      prompt += `. O objetivo é ${goal}`;
    }
    
    if (specificArea) {
      prompt += ` com foco específico em ${specificArea}`;
    }
    
    return prompt;
  };

  const handleGenerate = () => {
    // If using structured input, generate the prompt
    if (promptTab === "structured" && !aiPrompt) {
      const structuredPrompt = generateStructuredPrompt();
      setAiPrompt(structuredPrompt);
    }
    
    onGenerateAI();
  };

  return (
    <div className="space-y-6">
      {/* Basic checklist information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Title */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Título da lista de verificação"
              name="title"
              value={form.title || ""}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Categoria */}
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
          </div>
        </div>

        {/* Descrição */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito desta lista de verificação"
              name="description"
              value={form.description || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </div>

        {/* Data de Vencimento */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento</Label>
            <Input
              id="due_date"
              type="date"
              name="due_date"
              value={
                form.due_date ? format(new Date(form.due_date), "yyyy-MM-dd") : ""
              }
              onChange={handleInputChange}
              min={format(new Date(), "yyyy-MM-dd")}
            />
            <p className="text-sm text-muted-foreground">
              Opcional. Se definida, indica quando esta lista deve ser concluída.
            </p>
          </div>
        </div>

        {/* Empresa */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="company_id">Empresa</Label>
            {loadingCompanies ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={form.company_id?.toString() || undefined}
                onValueChange={(value) => handleSelectChange("company_id", value)}
              >
                <SelectTrigger id="company_id">
                  <SelectValue placeholder="Selecione uma empresa (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma empresa</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.fantasy_name || company.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Responsável */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="responsible_id">Responsável</Label>
            {loadingUsers ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={form.responsible_id?.toString() || undefined}
                onValueChange={(value) => handleSelectChange("responsible_id", value)}
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
          </div>
        </div>
      </div>

      {/* -- AI Assistant Selection -- */}
      <Card>
        <CardContent className="p-6">
          <AIAssistantSelector 
            selectedAssistant={selectedAssistant}
            onChange={setSelectedAssistant || (() => {})}
            openAIAssistant={openAIAssistant}
            onOpenAIAssistantChange={setOpenAIAssistant}
          />
        </CardContent>
      </Card>

      {/* -- Seção de geração IA -- */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Bot className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-medium">Geração de Checklist com IA</h3>
                <p className="text-sm text-muted-foreground">
                  Use o assistente de IA para criar um checklist personalizado
                </p>
              </div>
            </div>

            <Tabs value={promptTab} onValueChange={setPromptTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="free-text">Texto Livre</TabsTrigger>
                <TabsTrigger value="structured">Estruturado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="free-text" className="space-y-4">
                <div>
                  <Label htmlFor="ai-prompt">
                    Prompt para IA <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="Ex: Crie um checklist de inspeção de segurança para um canteiro de obras..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground">
                    Seja específico sobre o tipo de checklist, área de aplicação e objetivo.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="structured" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="industry">Setor/Indústria</Label>
                    <Input
                      id="industry"
                      placeholder="Ex: Construção civil, Alimentícia..."
                      value={structuredContext.industry}
                      onChange={(e) => handleStructuredInputChange('industry', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="companySize">Tamanho da Empresa</Label>
                    <Input
                      id="companySize"
                      placeholder="Ex: Pequena, Média, Grande..."
                      value={structuredContext.companySize}
                      onChange={(e) => handleStructuredInputChange('companySize', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goal">Objetivo do Checklist</Label>
                    <Input
                      id="goal"
                      placeholder="Ex: Auditorias internas, Inspeções diárias..."
                      value={structuredContext.goal}
                      onChange={(e) => handleStructuredInputChange('goal', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="specificArea">Área Específica</Label>
                    <Input
                      id="specificArea"
                      placeholder="Ex: NR-12, Operações, Processos..."
                      value={structuredContext.specificArea}
                      onChange={(e) => handleStructuredInputChange('specificArea', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Preencha as informações acima para gerar um prompt estruturado.</p>
                  {structuredContext.industry && (
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="font-medium">Prompt que será gerado:</p>
                      <p>{generateStructuredPrompt()}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div>
                <Label htmlFor="num-questions">
                  Número de Perguntas: <span className="font-medium">{numQuestions}</span>
                </Label>
                <Slider
                  id="num-questions"
                  min={3}
                  max={30}
                  step={1}
                  value={[numQuestions]}
                  onValueChange={(value) => setNumQuestions(value[0])}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione quantas perguntas você deseja que a IA gere.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={aiLoading || (!aiPrompt && promptTab === "free-text")}
                className="w-full"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Gerar Checklist com IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
