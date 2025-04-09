
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { FormSection } from "./FormSection";
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

interface BasicInfoSectionProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
}

export function BasicInfoSection({
  form,
  setForm,
  users,
  loadingUsers,
  companies,
  loadingCompanies
}: BasicInfoSectionProps) {
  return (
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
          <Label htmlFor="category">
            Categoria <span className="text-red-500">*</span>
          </Label>
          <Input
            id="category"
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Ex: NR-35, Inspeção de Equipamentos"
            required
          />
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
  );
}
