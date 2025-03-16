
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";

interface CreateChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateChecklistModal({ isOpen, onClose }: CreateChecklistModalProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [responsible, setResponsible] = useState("");
  const [loading, setLoading] = useState(false);
  const createChecklistMutation = useCreateChecklist();
  
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("general");
      setCompanyId("");
      setResponsible("");
      
      // Fetch companies and users
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch companies
          const { data: companiesData, error: companiesError } = await supabase
            .from('companies')
            .select('id, fantasy_name')
            .eq('status', 'active')
            .order('fantasy_name');
            
          if (companiesError) throw companiesError;
          setCompanies(companiesData || []);
          
          // Fetch users
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, name')
            .eq('status', 'active')
            .order('name');
            
          if (usersError) throw usersError;
          setUsers(usersData || []);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Erro ao carregar dados");
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [isOpen]);
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    
    try {
      setLoading(true);
      const newChecklist = await createChecklistMutation.mutateAsync({
        title,
        description,
        category,
        company_id: companyId || undefined,
        responsible_id: responsible || undefined,
        status: "pendente"
      });
      
      toast.success("Checklist criado com sucesso!");
      onClose();
      navigate(`/checklists/${newChecklist.id}`);
    } catch (error) {
      console.error("Error creating checklist:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Checklist</DialogTitle>
          <DialogDescription>
            Preencha as informações básicas para criar rapidamente um checklist.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do checklist"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição breve do checklist"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Segurança</SelectItem>
                <SelectItem value="quality">Qualidade</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="environment">Meio Ambiente</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="company">Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.fantasy_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select value={responsible} onValueChange={setResponsible}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Checklist'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
