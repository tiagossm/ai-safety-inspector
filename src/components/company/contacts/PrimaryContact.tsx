
import { Company } from "@/types/company";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { formatPhone } from "@/utils/formatters";

interface PrimaryContactProps {
  company: Company;
}

export function PrimaryContact({ company }: PrimaryContactProps) {
  if (!company.contact_name) return null;

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{company.contact_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{company.contact_name}</span>
              <Badge variant="outline">Principal</Badge>
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
  );
}
