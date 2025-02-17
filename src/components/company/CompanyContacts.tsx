
import { Contact, Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ContactForm } from "./contacts/ContactForm";
import { PrimaryContact } from "./contacts/PrimaryContact";
import { useContacts } from "@/hooks/useContacts";

interface CompanyContactsProps {
  company: Company;
  onEditContact?: () => void;
}

export function CompanyContacts({ company, onEditContact }: CompanyContactsProps) {
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

  const handleSubmit = async (data: any) => {
    await handleAddContact({
      company_id: company.id,
      ...data,
    });
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
