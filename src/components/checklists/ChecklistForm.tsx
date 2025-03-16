
import { useState, useEffect } from "react";
import { Checklist } from "@/types/checklist";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ChecklistFormProps {
  checklist: Checklist;
  users: any[];
  setChecklist: (checklist: Checklist) => void;
}

export default function ChecklistForm({ checklist, users, setChecklist }: ChecklistFormProps) {
  const [companies, setCompanies] = useState<{ id: string; fantasy_name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, fantasy_name')
          .eq('status', 'active')
          .order('fantasy_name', { ascending: true });
        
        if (error) throw error;
        
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChecklist({ ...checklist, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setChecklist({ ...checklist, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setChecklist({ ...checklist, [name]: checked });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setChecklist({ ...checklist, due_date: date.toISOString() });
    } else {
      setChecklist({ ...checklist, due_date: null });
    }
  };

  return (
    <div className="space-y-4 bg-card p-6 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            value={checklist.title}
            onChange={handleInputChange}
            placeholder="Título do checklist"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={checklist.category || ""}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="segurança">Segurança</SelectItem>
                <SelectItem value="saúde">Saúde</SelectItem>
                <SelectItem value="meio ambiente">Meio Ambiente</SelectItem>
                <SelectItem value="qualidade">Qualidade</SelectItem>
                <SelectItem value="manutenção">Manutenção</SelectItem>
                <SelectItem value="operação">Operação</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={checklist.description || ""}
          onChange={handleInputChange}
          placeholder="Descrição detalhada do checklist"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Select
            value={checklist.company_id || ""}
            onValueChange={(value) => handleSelectChange("company_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Nenhuma</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.fantasy_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="responsible">Responsável</Label>
          <Select
            value={checklist.responsible_id || ""}
            onValueChange={(value) => handleSelectChange("responsible_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Nenhum</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={checklist.status || "pendente"}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Data de Vencimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checklist.due_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checklist.due_date ? format(new Date(checklist.due_date), "PP") : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checklist.due_date ? new Date(checklist.due_date) : undefined}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="is_template" className="block mb-2">Modelo</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_template"
              checked={checklist.is_template || false}
              onCheckedChange={(checked) => handleSwitchChange("is_template", checked)}
            />
            <Label htmlFor="is_template">
              {checklist.is_template ? "Sim" : "Não"}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
