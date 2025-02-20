
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyContactFieldsProps {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export function CompanyContactFields({ contactName, contactPhone, contactEmail }: CompanyContactFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactName">Nome do Contato</Label>
          <Input
            id="contactName"
            value={contactName}
            readOnly
            className="bg-muted text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Telefone</Label>
          <Input
            id="contactPhone"
            value={contactPhone}
            readOnly
            className="bg-muted text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">E-mail</Label>
        <Input
          id="contactEmail"
          value={contactEmail}
          readOnly
          className="bg-muted text-foreground"
        />
      </div>
    </>
  );
}
