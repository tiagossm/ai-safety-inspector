
import { Checklist } from "@/types/checklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChecklistPermissions } from "@/hooks/checklist/useChecklistPermissions";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

// Checklist category options
const CATEGORIES = [
  { value: "safety", label: "Segurança" },
  { value: "quality", label: "Qualidade" },
  { value: "maintenance", label: "Manutenção" },
  { value: "environment", label: "Meio Ambiente" },
  { value: "operational", label: "Operacional" },
  { value: "general", label: "Geral" }
];

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" }
];

interface ChecklistFormProps {
  checklist: Checklist;
  users: any[];
  setChecklist: React.Dispatch<React.SetStateAction<Checklist | null>>;
}

export default function ChecklistForm({ checklist, users, setChecklist }: ChecklistFormProps) {
  const { data: permissions } = useChecklistPermissions(checklist.id);
  const canEdit = permissions?.write || false;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch companies user has access to
  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, fantasy_name')
          .eq('status', 'active')
          .order('fantasy_name');

        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={checklist.title}
            onChange={(e) => setChecklist({...checklist, title: e.target.value})}
            disabled={!canEdit}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={checklist.category || "general"} 
              onValueChange={(value) => setChecklist({...checklist, category: value})}
              disabled={!canEdit}
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
          
          <div className="grid gap-2">
            <Label htmlFor="company">Empresa</Label>
            <Select 
              value={checklist.company_id || ""} 
              onValueChange={(value) => setChecklist({...checklist, company_id: value})}
              disabled={!canEdit || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.fantasy_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select 
              value={checklist.responsible_id || ""} 
              onValueChange={(value) => setChecklist({...checklist, responsible_id: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={checklist.status || "pendente"} 
              onValueChange={(value) => setChecklist({...checklist, status: value as "pendente" | "em_andamento" | "concluido"})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="dueDate">Data de Vencimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checklist.due_date && "text-muted-foreground"
                )}
                disabled={!canEdit}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checklist.due_date ? (
                  format(new Date(checklist.due_date), "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checklist.due_date ? new Date(checklist.due_date) : undefined}
                onSelect={(date) => setChecklist({...checklist, due_date: date ? date.toISOString() : null})}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={checklist.description || ""}
            onChange={(e) => setChecklist({...checklist, description: e.target.value})}
            rows={3}
            disabled={!canEdit}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="template"
            checked={checklist.is_template}
            onCheckedChange={(checked) => setChecklist({...checklist, is_template: checked})}
            disabled={!canEdit}
          />
          <Label htmlFor="template">Template</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="status"
            checked={checklist.status_checklist === "ativo"}
            onCheckedChange={(checked) => 
              setChecklist({
                ...checklist, 
                status_checklist: checked ? "ativo" : "inativo"
              })
            }
            disabled={!canEdit}
          />
          <Label htmlFor="status">
            {checklist.status_checklist === "ativo" ? "Ativo" : "Inativo"}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
