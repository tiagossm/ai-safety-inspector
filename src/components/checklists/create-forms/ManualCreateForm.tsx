
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "./FormSection";
import { NewChecklist } from "@/types/checklist";
import { Card, CardContent } from "@/components/ui/card";
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

const QUESTION_TYPES = [
  { value: "sim/não", label: "Sim/Não" },
  { value: "texto", label: "Texto" },
  { value: "numérico", label: "Numérico" },
  { value: "múltipla escolha", label: "Múltipla Escolha" },
  { value: "data", label: "Data" },
  { value: "hora", label: "Hora" },
];

interface ManualCreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  questions: Array<{ text: string; type: string; required: boolean }>;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onQuestionChange: (index: number, field: string, value: any) => void;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
}

export function ManualCreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionChange,
  companies,
  loadingCompanies
}: ManualCreateFormProps) {
  return (
    <div className="space-y-6">
      <FormSection title="Informações Básicas">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nome da lista de verificação"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
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

        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Breve descrição sobre o propósito dessa lista de verificação"
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select 
              value={form.responsible_id || "none"} 
              onValueChange={(value) => setForm({ ...form, responsible_id: value === "none" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {loadingUsers ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email || 'Usuário sem nome'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="company">Empresa</Label>
            <Select 
              value={form.company_id || "none"} 
              onValueChange={(value) => setForm({ ...form, company_id: value === "none" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
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
            <Label htmlFor="due-date">Data de vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="due-date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.due_date ? (
                    format(new Date(form.due_date), "PPP", { locale: ptBR })
                  ) : (
                    "Escolha uma data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.due_date ? new Date(form.due_date) : undefined}
                  onSelect={(date) => 
                    setForm({ ...form, due_date: date ? date.toISOString() : null })
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2 self-end">
            <Switch
              id="template"
              checked={form.is_template}
              onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
            />
            <Label htmlFor="template">
              Salvar como template
            </Label>
          </div>
        </div>
      </FormSection>

      <FormSection title="Perguntas">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={index} className="p-0 overflow-hidden">
              <CardContent className="p-4 grid gap-4">
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="md:col-span-3">
                    <Label htmlFor={`question-${index}`}>Pergunta</Label>
                    <Input
                      id={`question-${index}`}
                      value={question.text}
                      onChange={(e) => onQuestionChange(index, 'text', e.target.value)}
                      placeholder="Digite a pergunta"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`question-type-${index}`}>Tipo</Label>
                    <Select 
                      value={question.type} 
                      onValueChange={(value) => onQuestionChange(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`question-required-${index}`}
                        checked={question.required}
                        onCheckedChange={(checked) => onQuestionChange(index, 'required', checked)}
                      />
                      <Label htmlFor={`question-required-${index}`}>Obrigatório</Label>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onRemoveQuestion(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={onAddQuestion}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar Nova Pergunta</span>
          </Button>
        </div>
      </FormSection>
    </div>
  );
}
