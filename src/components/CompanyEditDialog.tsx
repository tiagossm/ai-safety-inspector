import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  // Se quiser rodapé padronizado, pode usar:
  // DialogFooter,
} from "@/components/ui/dialog";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "./ui/use-toast";

// Ajuste se necessário (por exemplo, se cnpj não for string).
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
  onUpdate: (company: Company) => Promise<void>; 
  // ^ Promise<void> para deixar claro que é assíncrono
  onClose: () => void;
}

export function CompanyEditDialog({
  company,
  onUpdate,
  onClose,
}: CompanyEditDialogProps) {
  const { toast } = useToast();

  // Cria um estado local com cópia do objeto recebido.
  // Assim, caso o usuário cancele, não modificamos o original.
  const [editedCompany, setEditedCompany] = useState<Company>({ ...company });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Chama a função onUpdate passada via props, que faz a atualização no banco.
      await onUpdate(editedCompany);

      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
      });
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
            // Se quiser máscara, você pode usar um componente de máscara ou library.
            // Por ora, deixamos como texto simples.
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
     
