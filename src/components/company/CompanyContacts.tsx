
import { useState } from "react";
import { Contact, Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatPhone } from "@/utils/formatters";

type ContactFormData = {
  name: string;
  role: string;
  emails: string[];
  phones: string[];
  notes: string;
};

interface CompanyContactsProps {
  company: Company;
  onEditContact?: () => void;
}

export function CompanyContacts({ company, onEditContact }: CompanyContactsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<ContactFormData>();

  const handleAddContact = async (data: ContactFormData) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          company_id: company.id,
          name: data.name,
          role: data.role,
          emails: [data.emails[0]], // Taking first email for now
          phones: [data.phones[0]], // Taking first phone for now
          notes: data.notes,
        });

      if (error) throw error;

      toast({
        title: "Contato adicionado",
        description: "O contato foi adicionado com sucesso."
      });

      setIsOpen(false);
      reset();
    } catch (error) {
      toast({
        title: "Erro ao adicionar contato",
        description: "Não foi possível adicionar o contato.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "Contato excluído",
        description: "O contato foi excluído com sucesso."
      });

      setDeletingContact(null);
    } catch (error) {
      toast({
        title: "Erro ao excluir contato",
        description: "Não foi possível excluir o contato.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setValue('name', contact.name || '');
    setValue('role', contact.role || '');
    setValue('emails', contact.emails || []);
    setValue('phones', contact.phones || []);
    setValue('notes', contact.notes || '');
    setIsOpen(true);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contatos</h3>
        <Button variant="outline" size="sm" onClick={() => {
          reset();
          setEditingContact(null);
          setIsOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Contato
        </Button>
      </div>

      {company.contact_name && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{company.contact_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{company.contact_name}</span>
                  <Badge variant="outline">Principal</Badge>
                </div>
              </div>
              {company.contact_email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${company.contact_email}`}>{company.contact_email}</a>
                </div>
              )}
              {company.contact_phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{formatPhone(company.contact_phone)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Editar Contato" : "Novo Contato"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddContact)} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingContact ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingContact && handleDeleteContact(deletingContact.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
