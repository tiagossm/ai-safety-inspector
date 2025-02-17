
import { Contact, Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone } from "@/utils/formatters";
import { useState } from "react";

type ContactFormData = {
  name: string;
  role: string;
  emails: string[];
  phones: string[];
  notes: string;
  isPrimary: boolean;
};

interface CompanyContactsProps {
  company: Company;
  onEditContact?: () => void;
}

export function CompanyContacts({ company, onEditContact }: CompanyContactsProps) {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [emailFields, setEmailFields] = useState<string[]>(['']);
  const [phoneFields, setPhoneFields] = useState<string[]>(['']);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<ContactFormData>();

  const handleAddEmailField = () => {
    setEmailFields([...emailFields, '']);
  };

  const handleAddPhoneField = () => {
    setPhoneFields([...phoneFields, '']);
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
    } catch (error) {
      toast({
        title: "Erro ao excluir contato",
        description: "Não foi possível excluir o contato.",
        variant: "destructive"
      });
    }
  };

  const onSubmitContact = async (data: ContactFormData) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          company_id: company.id,
          name: data.name,
          role: data.role,
          emails: emailFields.filter(email => email.trim() !== ''),
          phones: phoneFields.filter(phone => phone.trim() !== ''),
          notes: data.notes,
          is_primary: data.isPrimary
        });

      if (error) throw error;

      toast({
        title: "Contato adicionado",
        description: "O contato foi adicionado com sucesso."
      });

      setIsAddingContact(false);
      reset();
      setEmailFields(['']);
      setPhoneFields(['']);
    } catch (error) {
      toast({
        title: "Erro ao adicionar contato",
        description: "Não foi possível adicionar o contato.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contatos</h3>
        <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Contato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nome" {...register('name', { required: true })} />
                <Input placeholder="Cargo" {...register('role', { required: true })} />
              </div>

              {/* Email fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Emails</label>
                {emailFields.map((_, index) => (
                  <div key={`email_${index}`} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder={`Email ${index + 1}`}
                      {...register(`emails.${index}`)}
                    />
                    {index === emailFields.length - 1 && (
                      <Button type="button" variant="outline" onClick={handleAddEmailField}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Phone fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefones</label>
                {phoneFields.map((_, index) => (
                  <div key={`phone_${index}`} className="flex gap-2">
                    <Input
                      placeholder={`Telefone ${index + 1}`}
                      {...register(`phones.${index}`)}
                    />
                    {index === phoneFields.length - 1 && (
                      <Button type="button" variant="outline" onClick={handleAddPhoneField}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Observações sobre o contato..."
                  {...register('notes')}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" {...register('isPrimary')} />
                <label>Contato Principal</label>
              </div>

              <Button type="submit" className="w-full">Salvar Contato</Button>
            </form>
          </DialogContent>
        </Dialog>
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
                  <Badge variant="outline">Focal</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onEditContact}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteContact(company.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
    </div>
  );
}
