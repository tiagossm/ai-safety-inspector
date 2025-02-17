
import { Contact, Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useContacts } from "@/hooks/useContacts";
import { ContactForm } from "./contacts/ContactForm";
import { PrimaryContact } from "./contacts/PrimaryContact";
import { ContactList } from "./contacts/ContactList";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompanyContactsProps {
  company: Company;
  onEditContact?: () => void;
}

export function CompanyContacts({ company, onEditContact }: CompanyContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const {
    isOpen,
    setIsOpen,
    editingContact,
    setEditingContact,
    deletingContact,
    setDeletingContact,
    handleAddContact,
    handleDeleteContact,
  } = useContacts();

  useEffect(() => {
    fetchContacts();
  }, [company.id]);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContacts(data);
    }
  };

  const handleSubmit = async (data: any) => {
    const success = await handleAddContact({
      company_id: company.id,
      ...data,
    });
    
    if (success) {
      fetchContacts();
    }
  };

  const handleDelete = async (contactId: string) => {
    const success = await handleDeleteContact(contactId);
    if (success) {
      fetchContacts();
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contatos</h3>
        <Button variant="outline" size="sm" onClick={() => {
          setEditingContact(null);
          setIsOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Contato
        </Button>
      </div>

      <PrimaryContact company={company} />
      
      <ContactList 
        contacts={contacts}
        onEdit={(contact) => {
          setEditingContact(contact);
          setIsOpen(true);
        }}
        onDelete={setDeletingContact}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Editar Contato" : "Novo Contato"}
            </DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleSubmit}
            onCancel={() => setIsOpen(false)}
            editingContact={editingContact}
          />
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
              onClick={() => deletingContact && handleDelete(deletingContact.id)}
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
