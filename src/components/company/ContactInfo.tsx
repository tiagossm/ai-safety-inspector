
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactInfoProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  onContactNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ContactInfo({
  contactName,
  contactEmail,
  contactPhone,
  onContactNameChange,
  onContactEmailChange,
  onContactPhoneChange,
}: ContactInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="contactName">Nome do Contato</Label>
        <Input
          id="contactName"
          placeholder="Nome do contato"
          value={contactName}
          onChange={onContactNameChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Email de Contato</Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="email@empresa.com"
          value={contactEmail}
          onChange={onContactEmailChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPhone">Telefone de Contato</Label>
        <Input
          id="contactPhone"
          placeholder="(00) 0000-0000"
          value={contactPhone}
          onChange={onContactPhoneChange}
        />
      </div>
    </div>
  );
}
