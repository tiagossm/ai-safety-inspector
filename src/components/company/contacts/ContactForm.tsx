
import { Contact } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

type ContactFormData = {
  name: string;
  role: string;
  emails: string[];
  phones: string[];
  notes: string;
};

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel: () => void;
  editingContact: Contact | null;
}

export function ContactForm({ onSubmit, onCancel, editingContact }: ContactFormProps) {
  const { register, handleSubmit } = useForm<ContactFormData>({
    defaultValues: editingContact ? {
      name: editingContact.name,
      role: editingContact.role,
      emails: editingContact.emails,
      phones: editingContact.phones,
      notes: editingContact.notes || '',
    } : undefined
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome</label>
        <Input {...register('name')} placeholder="Nome do contato" required />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Cargo</label>
        <Input {...register('role')} placeholder="Cargo do contato" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input 
          {...register('emails.0')} 
          type="email" 
          placeholder="Email do contato" 
          required 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Telefone</label>
        <Input 
          {...register('phones.0')} 
          placeholder="Telefone do contato" 
          required 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Observações</label>
        <Input {...register('notes')} placeholder="Observações sobre o contato" />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingContact ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
