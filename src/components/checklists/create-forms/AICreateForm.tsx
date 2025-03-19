
import { useState, ChangeEvent } from "react";
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
import { AIAssistantSelector, AIAssistantType } from "./AIAssistantSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Question type definition
interface AIQuestion {
  text: string;
  type: string;
  required: boolean;
  allowPhoto?: boolean;
  allowVideo?: boolean;
  allowAudio?: boolean;
  options?: string[];
  hint?: string;
  weight?: number;
  groupId?: string;
}

// Question group definition
interface QuestionGroup {
  id: string;
  title: string;
  questions: AIQuestion[];
}

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
  onSaveChecklist?: (questions: AIQuestion[]) => void;
}

/**
 * Enhanced AICreateForm with assistant selection and question grouping
 */
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
  onSaveChecklist,
}: AICreateFormProps) {
  // AI assistant selection
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("general");
  
  // Tab selection for prompt vs structured input
  const [promptTab, setPromptTab] = useState<string>("free-text");
  
  // Generated questions and groups
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  
  // For structured input
  const [structuredContext, setStructuredContext] = useState({
    industry: "",
    companySize: "",
    goal: "",
    specificArea: "",
  });

  // Generate categories based on assistant type
  const getDefaultCategories = (assistantType: AIAssistantType): string[] => {
    switch (assistantType) {
      case "workplace-safety":
        return ["Equipamentos de Proteção", "Ambiente de Trabalho", "Procedimentos", "Treinamentos"];
      case "compliance":
        return ["Documentação", "Processos", "Registros", "Auditorias"];
      case "quality":
        return ["Controle de Processo", "Inspeção", "Não-conformidades", "Melhorias"];
      default:
        return ["Geral", "Específico", "Opcional"];
    }
  };

  // Handle AI generation with structured data
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

  // Handle AI generation
  const handleGenerate = () => {
    // If using structured input, generate the prompt
    if (promptTab === "structured" && !aiPrompt) {
      const structuredPrompt = generateStructuredPrompt();
      setAiPrompt(structuredPrompt);
    }
    
    // Update form with assistant type
    setForm({
      ...form,
      category: mapAssistantToCategory(selectedAssistant),
    });
    
    // Call parent generate function
    onGenerateAI();
    
    // Create default question groups based on assistant type
    const categories = getDefaultCategories(selectedAssistant);
    const defaultGroups: QuestionGroup[] = categories.map((category, index) => ({
      id: `group-${index}`,
      title: category,
      questions: [],
    }));
    
    setQuestionGroups(defaultGroups);
  };

  // Map assistant type to category
  const mapAssistantToCategory = (assistant: AIAssistantType): string => {
    switch (assistant) {
      case "workplace-safety": return "safety";
      case "compliance": return "compliance";
      case "quality": return "quality";
      default: return "general";
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  // Handle structured input changes
  const handleStructuredInputChange = (field: string, value: string) => {
    setStructuredContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Allow for regeneration of questions
  const handleRegenerateQuestions = () => {
    // Prompt user to confirm regeneration
    if (questionGroups.some(group => group.questions.length > 0)) {
      if (!window.confirm("Isso irá substituir todas as perguntas geradas. Continuar?")) {
        return;
      }
    }
    
    handleGenerate();
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
            onChange={setSelectedAssistant}
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
                      <p className="font-medium">Preview do prompt:</p>
                      <p>{generateStructuredPrompt()}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Slider de número de perguntas */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="num-questions">Número de Perguntas</Label>
                <span className="text-sm font-medium">{numQuestions}</span>
              </div>
              <Slider
                id="num-questions"
                value={[numQuestions]}
                onValueChange={(value) => setNumQuestions(value[0])}
                min={5}
                max={50}
                step={5}
              />
            </div>

            {/* Botão para gerar perguntas via IA */}
            <div className="flex justify-end gap-2">
              {questionGroups.some(group => group.questions.length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={handleRegenerateQuestions} 
                  disabled={aiLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
              )}
              
              <Button 
                variant="secondary" 
                onClick={handleGenerate} 
                disabled={aiLoading}
              >
                {aiLoading ? "Gerando..." : "Gerar via IA"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -- Exibir e editar perguntas geradas (IA) em grupos -- */}
      {questionGroups.length > 0 && (
        <Card>
          <CardContent className="p-6">
            {/* Later, we'll implement the GroupedQuestionsSection component here */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
