
import { Contact, Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
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
  email: string;
  phone: string;
  isPrimary: boolean;
};

interface CompanyContactsProps {
  company: Company;
}

export function CompanyContacts({ company }: CompanyContactsProps) {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<ContactFormData>();

  const onSubmitContact = async (data: ContactFormData) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          company_id: company.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          is_primary: data.isPrimary
        });

      if (error) throw error;

      toast({
        title: "Contato adicionado",
        description: "O contato foi adicionado com sucesso."
      });

      setIsAddingContact(false);
      reset();
    } catch (error) {
      toast({
        title: "Erro ao adicionar contato",
        description: "Não foi possível adicionar o contato.",
        variant: "destructive"
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
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Contato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-4">
              <Input placeholder="Nome" {...register('name', { required: true })} />
              <Input type="email" placeholder="Email" {...register('email', { required: true })} />
              <Input placeholder="Telefone" {...register('phone', { required: true })} />
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
              <div className="flex items-center gap-2">
                <span className="font-medium">{company.contact_name}</span>
                <Badge variant="outline">Focal</Badge>
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
