
import React from "react";
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

export function AICreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  companies,
  loadingCompanies,
  aiPrompt,
  setAiPrompt,
  numQuestions,
  setNumQuestions,
  onGenerateAI,
  aiLoading,
  selectedAssistant,
  setSelectedAssistant,
  openAIAssistant,
  setOpenAIAssistant,
  assistants,
  loadingAssistants
}: AICreateFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  // Handle assistant type change
  const handleAssistantTypeChange = (value: AIAssistantType) => {
    setSelectedAssistant(value);
  };

  // Handle OpenAI assistant selection
  const handleOpenAIAssistantChange = (value: string) => {
    setOpenAIAssistant(value);
  };

  return (
    <div className="space-y-6">
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
              value={form.category || ""}
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
                      {company.fantasy_name || company.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-sm text-muted-foreground">
              Opcional. Vincula este checklist a uma empresa específica.
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
            <p className="text-sm text-muted-foreground">
              Opcional. Define quem é responsável por este checklist.
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-slate-50">
        <h3 className="text-lg font-medium mb-4">Configurações de Geração por IA</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-type">Tipo de Assistente</Label>
            <Select 
              value={selectedAssistant} 
              onValueChange={(value) => handleAssistantTypeChange(value as AIAssistantType)}
            >
              <SelectTrigger id="ai-type">
                <SelectValue placeholder="Selecione o tipo de assistente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Assistente Geral</SelectItem>
                <SelectItem value="workplace-safety">Segurança do Trabalho</SelectItem>
                <SelectItem value="compliance">Conformidade</SelectItem>
                <SelectItem value="quality">Qualidade</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione um tipo para gerar perguntas específicas para cada área.
            </p>
          </div>
          
          <div>
            <Label htmlFor="openai-assistant">Assistente OpenAI (avançado)</Label>
            {loadingAssistants ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select 
                value={openAIAssistant} 
                onValueChange={handleOpenAIAssistantChange}
              >
                <SelectTrigger id="openai-assistant">
                  <SelectValue placeholder="Selecione um assistente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum (usar assistente padrão)</SelectItem>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name} ({assistant.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Opcional. Utilize um assistente personalizado da sua conta OpenAI.
            </p>
          </div>
          
          <div>
            <Label htmlFor="num-questions">Número de Perguntas: {numQuestions}</Label>
            <Slider 
              id="num-questions"
              defaultValue={[numQuestions]} 
              min={5} 
              max={50} 
              step={1}
              onValueChange={(values) => setNumQuestions(values[0])}
              className="my-4"
            />
            <p className="text-sm text-muted-foreground">
              Defina quantas perguntas você deseja que a IA gere.
            </p>
          </div>
          
          <div>
            <Label htmlFor="prompt">Descreva o que você deseja verificar</Label>
            <Textarea
              id="prompt"
              placeholder="Ex: Crie um checklist para inspeção de segurança em um canteiro de obras"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={5}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Seja específico e inclua detalhes relevantes para obter melhores resultados.
            </p>
          </div>
          
          <Button
            type="button"
            onClick={onGenerateAI}
            disabled={aiLoading || !aiPrompt.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {aiLoading ? "Gerando..." : "Gerar Checklist com IA"}
          </Button>
        </div>
      </div>
    </div>
  );
}
