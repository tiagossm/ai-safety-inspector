
import { Contact } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { formatPhone } from "@/utils/formatters";
import { Card } from "@/components/ui/card";

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactList({ contacts, onEdit, onDelete }: ContactListProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-3">
        {contacts?.length ? (
          contacts.map((contact) => (
            <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{contact.name}</span>
                    {contact.role && (
                      <span className="text-sm text-muted-foreground">
                        ({contact.role})
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {contact.emails?.[0] && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <a 
                          href={`mailto:${contact.emails[0]}`}
                          className="hover:text-primary transition-colors"
                        >
                          {contact.emails[0]}
                        </a>
                      </div>
                    )}
                    {contact.phones?.[0] && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{formatPhone(contact.phones[0])}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(contact)}
                    className="hover:bg-primary/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(contact)}
                    className="hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            Nenhum contato adicional cadastrado
          </div>
        )}
      </div>
    </Card>
  );
}
