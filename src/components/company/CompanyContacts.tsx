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
import { Phone, Mail, UserCircle, Briefcase, Trash2, Edit, MapPin, Star, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompanyContactsProps {
  companyId: string;
  contacts: Contact[];
  onContactsChange: () => void;
}

export function CompanyContacts({ companyId, contacts, onContactsChange }: CompanyContactsProps) {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [filter, setFilter] = useState("");
  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    emails: [""],
    phones: [""],
    address: "",
    isFocal: false,
    contactType: "Comercial",
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
      setNewContact({ name: "", role: "", emails: [""], phones: [""], address: "", isFocal: false, contactType: "Comercial", notes: "" });
      onContactsChange();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar contato",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-gray-500" />
        <Input
          placeholder="Buscar contato..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Botão de adicionar contato */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contatos</h3>
        <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Adicionar Contato</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Contato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Nome</Label>
              <Input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />

              <Label>Cargo</Label>
              <Input value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} />

              <Label>Emails</Label>
              {newContact.emails.map((email, index) => (
                <Input
                  key={index}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const emails = [...newContact.emails];
                    emails[index] = e.target.value;
                    setNewContact({ ...newContact, emails });
                  }}
                />
              ))}
              <Button onClick={() => setNewContact({ ...newContact, emails: [...newContact.emails, ""] })} variant="outline">Adicionar Email</Button>

              <Label>Telefones</Label>
              {newContact.phones.map((phone, index) => (
                <Input
                  key={index}
                  value={phone}
                  onChange={(e) => {
                    const phones = [...newContact.phones];
                    phones[index] = e.target.value;
                    setNewContact({ ...newContact, phones });
                  }}
                />
              ))}
              <Button onClick={() => setNewContact({ ...newContact, phones: [...newContact.phones, ""] })} variant="outline">Adicionar Telefone</Button>

              <Label>Endereço</Label>
              <Input value={newContact.address} onChange={(e) => setNewContact({ ...newContact, address: e.target.value })} />

              <Label>Tipo de Contato</Label>
              <select
  value={newContact.contactType}
  onChange={(e) => setNewContact({ ...newContact, contactType: e.target.value })}
  className="w-full border rounded-md p-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
>
  <option value="Comercial">Comercial</option>
  <option value="Técnico">Técnico</option>
  <option value="Financeiro">Financeiro</option>
  <option value="Jurídico">Jurídico</option>
</select>


              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newContact.isFocal}
                  onChange={(e) => setNewContact({ ...newContact, isFocal: e.target.checked })}
                />
                <Label>Contato Focal</Label>
              </div>

              <Label>Observações</Label>
              <Textarea value={newContact.notes} onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })} />

              <Button onClick={handleAddContact} className="w-full">Salvar Contato</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de contatos */}
      <div className="grid gap-4 md:grid-cols-2">
        {contacts
          .filter(contact => contact.name.toLowerCase().includes(filter.toLowerCase()))
          .map((contact) => (
            <div key={contact.id} className={`p-4 border rounded-lg space-y-2 ${contact.isFocal ? "border-yellow-500" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  <span className="font-medium">{contact.name}</span>
                </div>
                <div className="flex gap-2">
                  {contact.isFocal && <Star className="h-5 w-5 text-yellow-500" title="Contato Focal" />}
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p><Briefcase /> {contact.role} ({contact.contactType})</p>
              {contact.emails.map((email, i) => <p key={i}><Mail /> {email}</p>)}
              {contact.phones.map((phone, i) => <p key={i}><Phone /> {phone}</p>)}
              <p><MapPin /> {contact.address}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
