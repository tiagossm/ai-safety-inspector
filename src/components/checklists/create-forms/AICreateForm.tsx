
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewChecklist } from "@/types/checklist";
import { CompanyListItem } from "@/types/CompanyListItem";

// Checklist category options
const CATEGORIES = [
  { value: "safety", label: "Segurança" },
  { value: "quality", label: "Qualidade" },
  { value: "maintenance", label: "Manutenção" },
  { value: "environment", label: "Meio Ambiente" },
  { value: "operational", label: "Operacional" },
  { value: "general", label: "Geral" }
];

interface AICreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  aiPrompt: string;
  setAiPrompt: React.Dispatch<React.SetStateAction<string>>;
  numQuestions: number;
  setNumQuestions: React.Dispatch<React.SetStateAction<number>>;
  onGenerateAI: () => void;
  aiLoading: boolean;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
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
  loadingCompanies
}: AICreateFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ai-prompt">Descreva o checklist que você quer criar</Label>
          <Textarea
            id="ai-prompt"
            placeholder="Ex: Checklist de inspeção de segurança para construção civil com foco em trabalho em altura"
            className="min-h-[100px]"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="num-questions">Número de perguntas: {numQuestions}</Label>
          </div>
          <Slider
            id="num-questions"
            min={5}
            max={30}
            step={1}
            value={[numQuestions]}
            onValueChange={(value) => setNumQuestions(value[0])}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title-ai">Título (opcional)</Label>
            <Input
              id="title-ai"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Gerado automaticamente se não preenchido"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category-ai">Categoria</Label>
            <Select 
              value={form.category} 
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="responsible-ai">Responsável</Label>
            <Select 
              value={form.responsible_id || ""} 
              onValueChange={(value) => setForm({ ...form, responsible_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {loadingUsers ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="company-ai">Empresa</Label>
            <Select 
              value={form.company_id || ""} 
              onValueChange={(value) => setForm({ ...form, company_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {loadingCompanies ? (
                  <SelectItem value="loading" disabled>Carregando empresas...</SelectItem>
                ) : (
                  companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.fantasy_name || 'Empresa sem nome'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="due-date-ai">Data de vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="due-date-ai"
                  type="button"
                  className="w-full flex items-center justify-between rounded px-3 py-2 text-sm border border-input bg-background"
                >
                  <span>
                    {form.due_date ? (
                      format(new Date(form.due_date), "PPP", { locale: ptBR })
                    ) : (
                      "Escolha uma data"
                    )}
                  </span>
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.due_date ? new Date(form.due_date) : undefined}
                  onSelect={(date) => 
                    setForm({ ...form, due_date: date ? date.toISOString() : null })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2 self-end">
            <Switch
              id="template-ai"
              checked={form.is_template}
              onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
            />
            <Label htmlFor="template-ai">
              Salvar como template
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
