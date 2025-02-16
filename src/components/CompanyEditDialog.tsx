
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "./ui/use-toast";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";

interface CompanyEditDialogProps {
  company: Company;
  onClose: () => void;
  onSave: () => Promise<void>;
  open: boolean;
}

export function CompanyEditDialog({
  company,
  onClose,
  onSave,
  open,
}: CompanyEditDialogProps) {
  const { toast } = useToast();
  const [editedCompany, setEditedCompany] = useState<Company>({ ...company });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          fantasy_name: editedCompany.fantasy_name,
          cnpj: editedCompany.cnpj,
          cnae: editedCompany.cnae,
          contact_email: editedCompany.contact_email,
          contact_phone: editedCompany.contact_phone,
          contact_name: editedCompany.contact_name,
          employee_count: editedCompany.employee_count,
        })
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
      });
      
      await onSave();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados da empresa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Fantasia */}
          <div>
            <label className="text-sm font-medium" htmlFor="fantasy_name">
              Nome Fantasia
            </label>
            <Input
              id="fantasy_name"
              value={editedCompany.fantasy_name || ""}
              onChange={(e) =>
                setEditedCompany({ ...editedCompany, fantasy_name: e.target.value })
              }
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="text-sm font-medium" htmlFor="cnpj">
              CNPJ
            </label>
            <Input
              id="cnpj"
              value={editedCompany.cnpj}
              onChange={(e) =>
                setEditedCompany({ ...editedCompany, cnpj: e.target.value })
              }
            />
          </div>

          {/* CNAE */}
          <div>
            <label className="text-sm font-medium" htmlFor="cnae">
              CNAE
            </label>
            <Input
              id="cnae"
              value={editedCompany.cnae || ""}
              onChange={(e) =>
                setEditedCompany({ ...editedCompany, cnae: e.target.value })
              }
            />
          </div>

          {/* E-mail de contato */}
          <div>
            <label className="text-sm font-medium" htmlFor="contact_email">
              E-mail
            </label>
            <Input
              id="contact_email"
              type="email"
              autoComplete="email"
              value={editedCompany.contact_email || ""}
              onChange={(e) =>
                setEditedCompany({
                  ...editedCompany,
                  contact_email: e.target.value,
                })
              }
            />
          </div>

          {/* Telefone de contato */}
          <div>
            <label className="text-sm font-medium" htmlFor="contact_phone">
              Telefone
            </label>
            <Input
              id="contact_phone"
              type="tel"
              autoComplete="tel"
              value={editedCompany.contact_phone || ""}
              onChange={(e) =>
                setEditedCompany({
                  ...editedCompany,
                  contact_phone: e.target.value,
                })
              }
            />
          </div>

          {/* Nome do Contato */}
          <div>
            <label className="text-sm font-medium" htmlFor="contact_name">
              Nome do Contato
            </label>
            <Input
              id="contact_name"
              value={editedCompany.contact_name || ""}
              onChange={(e) =>
                setEditedCompany({
                  ...editedCompany,
                  contact_name: e.target.value,
                })
              }
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
