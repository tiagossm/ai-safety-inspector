
import { useState } from "react";
import { Contact } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useContacts() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  const handleAddContact = async (data: {
    company_id: string;
    name: string;
    role: string;
    emails: string[];
    phones: string[];
    notes: string;
  }) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert(data);

      if (error) throw error;

      toast({
        title: "Contato adicionado",
        description: "O contato foi adicionado com sucesso."
      });

      setIsOpen(false);
      return true;
    } catch (error) {
      toast({
        title: "Erro ao adicionar contato",
        description: "Não foi possível adicionar o contato.",
        variant: "destructive"
      });
      return false;
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
      return true;
    } catch (error) {
      toast({
        title: "Erro ao excluir contato",
        description: "Não foi possível excluir o contato.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isOpen,
    setIsOpen,
    editingContact,
    setEditingContact,
    deletingContact,
    setDeletingContact,
    handleAddContact,
    handleDeleteContact,
  };
}
