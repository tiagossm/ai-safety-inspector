import { useState } from "react";
import { Contact } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, Mail, UserCircle, Briefcase, Trash2, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompanyContactsProps {
  companyId: string;
  contacts: Contact[];
  onContactsChange: () => void;
}

export function CompanyContacts({ companyId, contacts, onContactsChange }: CompanyContactsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    notes: "",
  });
  const { toast } = useToast();

  // Adicionar contato
  const handleAddContact = async () => {
    try {
      const { error } = await supabase
        .from("contacts")
        .insert({
          company_id: companyId,
          ...newContact,
        });

      if (error) throw error;

      toast({
        title: "Contato adicionado",
        description: "O contato foi adicionado com sucesso.",
      });

      setIsAddingContact(false);
      setNewContact({ name: "", role: "", email: "", phone: "", notes: "" });
      onContactsChange();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar contato",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Editar contato
  const handleEditContact = async () => {
    if (!currentContact) return;

    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: currentContact.name,
          role: currentContact.role,
          email: currentContact.email,
          phone: currentContact.phone,
          notes: currentContact.notes,
        })
        .eq("id", currentContact.id);

      if (error) throw error;

      toast({
        title: "Contato atualizado",
        description: "As informações do contato foram atualizadas.",
      });

      setIsEditing(false);
      setCurrentContact(null);
      onContactsChange();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar contato",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Remover contato
  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contactId);

      if (error) throw error;

      toast({
        title: "Contato removido",
        description: "O contato foi excluído com sucesso.",
      });

      onContactsChange();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir contato",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contatos</h3>
        <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Adicionar Contato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Contato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={newContact.role}
                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
              />
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
              />
              <Button onClick={handleAddContact} className="w-full">
                Salvar Contato
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <div key={contact.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                <span className="font-medium">{contact.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentContact(contact);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteContact(contact.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{contact.role}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{contact.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{contact.phone}</span>
            </div>
            {contact.notes && (
              <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{contact.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
