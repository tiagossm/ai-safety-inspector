
import { Contact } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { formatPhone } from "@/utils/formatters";

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactList({ contacts, onEdit, onDelete }: ContactListProps) {
  if (!contacts?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhum contato adicional cadastrado
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <div key={contact.id} className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{contact.name}</span>
                {contact.role && (
                  <span className="text-sm text-muted-foreground">
                    ({contact.role})
                  </span>
                )}
              </div>
              {contact.emails?.[0] && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${contact.emails[0]}`}>{contact.emails[0]}</a>
                </div>
              )}
              {contact.phones?.[0] && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{formatPhone(contact.phones[0])}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(contact)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(contact)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
