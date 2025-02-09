
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Json } from "@/integrations/supabase/types";

type Company = {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  employee_count: number | null;
  metadata: Json | null;
  created_at: string;
};

interface CompanyEditDialogProps {
  company: Company;
  onUpdate: (company: Company) => void;
}

export function CompanyEditDialog({ company, onUpdate }: CompanyEditDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Empresa</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome Fantasia</label>
          <Input
            value={company.fantasy_name || ""}
            onChange={(e) => onUpdate({
              ...company,
              fantasy_name: e.target.value
            })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">CNAE</label>
          <Input
            value={company.cnae || ""}
            onChange={(e) => onUpdate({
              ...company,
              cnae: e.target.value
            })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            value={company.contact_email || ""}
            onChange={(e) => onUpdate({
              ...company,
              contact_email: e.target.value
            })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Telefone</label>
          <Input
            value={company.contact_phone || ""}
            onChange={(e) => onUpdate({
              ...company,
              contact_phone: e.target.value
            })}
          />
        </div>
        <Button 
          className="w-full"
          onClick={() => onUpdate(company)}
        >
          Salvar Alterações
        </Button>
      </div>
    </DialogContent>
  );
}
