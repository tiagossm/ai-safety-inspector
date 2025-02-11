
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "./ui/use-toast";

type Company = {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  employee_count: number | null;
  metadata: Json | null;
  created_at: string;
};

interface CompanyEditDialogProps {
  company: Company;
  onUpdate: (company: Company) => void;
  onClose: () => void;
}

export function CompanyEditDialog({ company, onUpdate, onClose }: CompanyEditDialogProps) {
  const { toast } = useToast();
  const [editedCompany, setEditedCompany] = useState<Company>({ ...company });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate(editedCompany);
      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados da empresa.",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Empresa</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome Fantasia</label>
          <Input
            value={editedCompany.fantasy_name || ""}
            onChange={(e) => setEditedCompany({ ...editedCompany, fantasy_name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">CNAE</label>
          <Input
            value={editedCompany.cnae || ""}
            onChange={(e) => setEditedCompany({ ...editedCompany, cnae: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            value={editedCompany.contact_email || ""}
            onChange={(e) => setEditedCompany({ ...editedCompany, contact_email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Telefone</label>
          <Input
            value={editedCompany.contact_phone || ""}
            onChange={(e) => setEditedCompany({ ...editedCompany, contact_phone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Nome do Contato</label>
          <Input
            value={editedCompany.contact_name || ""}
            onChange={(e) => setEditedCompany({ ...editedCompany, contact_name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Quantidade de Funcionários</label>
          <Input
            type="number"
            value={editedCompany.employee_count || ""}
            onChange={(e) => setEditedCompany({ ...editedCompany, employee_count: parseInt(e.target.value) || null })}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
