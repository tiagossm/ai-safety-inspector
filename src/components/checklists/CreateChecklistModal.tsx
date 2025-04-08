
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { CompanyListItem } from "@/hooks/checklist/useFilterChecklists";

interface CreateChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  creationMethod?: 'manual' | 'ia' | 'csv';
}

export function CreateChecklistModal({ 
  isOpen, 
  onClose,
  creationMethod = 'manual'
}: CreateChecklistModalProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  
  const createChecklist = useCreateChecklist();
  
  useEffect(() => {
    const fetchCompanies = async () => {
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
        toast.error('Erro ao carregar empresas');
      }
    };
    
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    
    setLoading(true);
    
    try {
      const newChecklist = {
        title,
        description,
        category,
        company_id: companyId || null,
        is_template: isTemplate,
        status_checklist: "ativo" as "ativo" | "inativo",
        origin: creationMethod // Ensure origin is set based on creation method
      };
      
      const result = await createChecklist.mutateAsync(newChecklist);
      
      toast.success("Checklist criado com sucesso!");
      onClose();
      
      try {
        await supabase.from('checklist_history').insert({
          checklist_id: result.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'create',
          details: 'Criou o checklist'
        });
      } catch (historyError) {
        console.warn("Erro ao registrar histórico:", historyError);
      }
      
      navigate(`/checklists/${result.id}`);
    } catch (error) {
      console.error("Error creating checklist:", error);
      toast.error("Erro ao criar checklist");
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setCompanyId("");
    setIsTemplate(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Checklist</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do checklist"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do checklist"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
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
          
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.fantasy_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isTemplate"
              checked={isTemplate}
              onCheckedChange={(checked) => setIsTemplate(checked as boolean)}
            />
            <Label htmlFor="isTemplate">Criar como modelo</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Checklist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
