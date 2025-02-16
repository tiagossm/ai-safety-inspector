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
import { Phone, Mail, UserCircle, Briefcase, Trash2, Edit, MapPin, Star, Search, Plus } from "lucide-react";
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
  const [customContactTypes, setCustomContactTypes] = useState<string[]>([]);
  const [newContactType, setNewContactType] = useState("");

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

  // Adicionar novo tipo de contato à lista personalizada
  const handleAddContactType = () => {
    if (newContactType.trim() && !customContactTypes.includes(newContactType)) {
      setCustomContactTypes([...customContactTypes, newContactType]);
      setNewContactType("");
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
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-gray-800 text-white rounded-md">
            <DialogHeader>
              <DialogTitle>Novo Contato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Nome</Label>
              <Input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />

              <Label>Cargo</Label>
              <Input value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} />

              {/* Emails */}
              <Label>Emails</Label>
              <div className="space-y-2">
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
                <Button onClick={() => setNewContact({ ...newContact, emails: [...newContact.emails, ""] })} variant="outline">
                  Adicionar Email
                </Button>
              </div>

              {/* Telefones */}
              <Label>Telefones</Label>
              <div className="space-y-2">
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
                <Button onClick={() => setNewContact({ ...newContact, phones: [...newContact.phones, ""] })} variant="outline">
                  Adicionar Telefone
                </Button>
              </div>

              {/* Endereço */}
              <Label>Endereço</Label>
              <Input value={newContact.address} onChange={(e) => setNewContact({ ...newContact, address: e.target.value })} />

              {/* Tipo de Contato */}
              <Label>Tipo de Contato</Label>
              <div className="flex gap-2">
                <select
                  value={newContact.contactType}
                  onChange={(e) => setNewContact({ ...newContact, contactType: e.target.value })}
                  className="w-full border rounded-md p-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Comercial">Comercial</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Jurídico">Jurídico</option>
                  {customContactTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Novo Tipo"
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value)}
                  className="w-40"
                />
                <Button onClick={handleAddContactType} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Contato Focal */}
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
    </div>
  );
}
