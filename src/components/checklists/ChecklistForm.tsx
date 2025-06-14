
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checklist } from "@/types/checklist";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useEffect as useReactEffect, useState as useReactState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyListItem } from "@/hooks/checklist/useFilterChecklists";

interface ChecklistFormProps {
  checklist?: Checklist | null;
  users?: any[];
  setChecklist?: (checklist: Checklist) => void;
  onCreate?: (checklistData: any) => void;
}

// Create a DatePicker component to replace the missing module
function DatePicker({ date, setDate, className }: {
  date: Date | undefined;
  setDate: (date: Date | null) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: pt }) : <span>Selecione uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function ChecklistForm({ checklist, users = [], setChecklist, onCreate }: ChecklistFormProps) {
  const [isTemplate, setIsTemplate] = useState(false);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  
  // Fetch companies for dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, fantasy_name')
          .eq('status', 'active')
          .order('fantasy_name', { ascending: true });
          
        if (error) {
          console.error("Error fetching companies:", error);
          toast.error("Erro ao carregar empresas");
          throw error;
        }
        
        console.log("Companies loaded:", data?.length || 0);
        setCompanies(data || []);
      } catch (error) {
        console.error("Error in fetchCompanies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  useEffect(() => {
    if (checklist) {
      setIsTemplate(checklist.is_template || false);
    }
  }, [checklist]);

  const handleChange = (field: string, value: any) => {
    if (checklist && setChecklist) {
      // Log the change for debugging
      console.log(`Updating checklist field ${field}:`, value);
      
      const updatedChecklist = {
        ...checklist,
        [field]: value
      };
      
      setChecklist(updatedChecklist);
      
      // Log for company association
      if (field === "company_id") {
        const companyName = companies.find(c => c.id === value)?.fantasy_name || "Unknown";
        console.log(`Checklist associated with company: ${companyName} (${value})`);
      }
    }
  };

  // Handle creation mode when onCreate is provided
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreate && checklist) {
      onCreate(checklist);
    }
  };

  if (!checklist && !onCreate) return null;

  const formContent = (
    <div className="space-y-6 p-6 border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Nome do Checklist</Label>
          <Input
            id="title"
            value={checklist?.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Digite o título do checklist"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            value={checklist.category || ""}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Digite a categoria do checklist"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={checklist.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Breve descrição sobre o checklist"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_id">Empresa</Label>
          <Select
            value={checklist.company_id || "none"}
            onValueChange={(value) => handleChange("company_id", value === "none" ? null : value)}
          >
            <SelectTrigger className={isLoadingCompanies ? "opacity-70" : ""}>
              <SelectValue placeholder={isLoadingCompanies ? "Carregando empresas..." : "Selecione uma empresa"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma empresa</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.fantasy_name || 'Empresa sem nome'}
                </SelectItem>
              ))}
              {companies.length === 0 && !isLoadingCompanies && (
                <SelectItem value="no-companies" disabled>
                  Nenhuma empresa disponível
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsavel">Responsável</Label>
          <Select
            value={checklist.responsible_id || "none"}
            onValueChange={(value) => handleChange("responsible_id", value === "none" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum responsável</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email || 'Usuário sem nome'}
                </SelectItem>
              ))}
              {users.length === 0 && (
                <SelectItem value="no-users-placeholder" disabled>
                  Nenhum usuário disponível
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Data de Vencimento</Label>
          <DatePicker
            date={checklist.due_date ? new Date(checklist.due_date) : undefined}
            setDate={(date) => handleChange("due_date", date?.toISOString())}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <RadioGroup
            value={checklist.status || "pendente"}
            onValueChange={(value) => handleChange("status", value)}
            className="flex space-x-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pendente" id="status-pendente" />
              <Label htmlFor="status-pendente">Pendente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="em_andamento" id="status-em_andamento" />
              <Label htmlFor="status-em_andamento">Em Andamento</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="concluido" id="status-concluido" />
              <Label htmlFor="status-concluido">Concluído</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status_checklist">Estado do Checklist</Label>
          <RadioGroup
            value={checklist.status_checklist || "ativo"}
            onValueChange={(value) => handleChange("status_checklist", value as "ativo" | "inativo")}
            className="flex space-x-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ativo" id="status_checklist-ativo" />
              <Label htmlFor="status_checklist-ativo">Ativo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inativo" id="status_checklist-inativo" />
              <Label htmlFor="status_checklist-inativo">Inativo</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2 flex items-center gap-4">
          <Switch
            id="is_template"
            checked={isTemplate}
            onCheckedChange={(checked) => {
              setIsTemplate(checked);
              handleChange("is_template", checked);
            }}
          />
          <Label htmlFor="is_template">Este é um template</Label>
        </div>
      </div>
    </div>
  );

  // If onCreate is provided, wrap in a form
  if (onCreate) {
    return (
      <form onSubmit={handleSubmit}>
        {formContent}
        <div className="mt-6 flex justify-end">
          <Button type="submit">Criar Checklist</Button>
        </div>
      </form>
    );
  }

  return formContent;
}
