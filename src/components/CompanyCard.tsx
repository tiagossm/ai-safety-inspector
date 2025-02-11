
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { CompanyEditDialog } from "@/components/CompanyEditDialog";
import { Company, CompanyMetadata, Contact } from "@/types/company";
import { CompanyActions } from "@/components/company/CompanyActions";
import { CompanyDetails, CompanyTitle } from "@/components/company/CompanyDetails";
import { CompanyUnits } from "@/components/company/CompanyUnits";
import { CompanyContacts } from "@/components/company/CompanyContacts";
import { generateCSV } from "@/utils/companyUtils";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface CompanyCardProps {
  company: Company;
  onDelete: (id: string) => void;
  onEdit: (company: Company) => void;
  onStartInspection: (company: Company) => void;
  onViewLegalNorms: (company: Company) => void;
}

export function CompanyCard({
  company,
  onDelete,
  onEdit,
  onStartInspection,
  onViewLegalNorms,
}: CompanyCardProps) {
  const [unitsExpanded, setUnitsExpanded] = useState(false);
  const [contactsExpanded, setContactsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  const metadata = company.metadata as CompanyMetadata | null;
  const units = metadata?.units || [];

  useEffect(() => {
    if (contactsExpanded) {
      loadContacts();
    }
  }, [contactsExpanded, company.id]);

  const loadContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContacts(data);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEdit(company);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'potential':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CompanyTitle company={company} />
            <Badge variant="outline" className={getStatusColor(company.status)}>
              {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
            </Badge>
          </div>
          <CompanyActions
            company={company}
            unitsExpanded={unitsExpanded}
            unitsCount={units.length}
            onDelete={onDelete}
            onEdit={handleEdit}
            onStartInspection={onStartInspection}
            onViewLegalNorms={onViewLegalNorms}
            onToggleUnits={() => setUnitsExpanded(!unitsExpanded)}
            onExportCSV={() => generateCSV(company, units)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CompanyDetails company={company} />
        <CompanyUnits units={units} expanded={unitsExpanded} />
        
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setContactsExpanded(!contactsExpanded)}
            className="w-full"
          >
            {contactsExpanded ? "Ocultar Contatos" : "Ver Contatos"}
          </Button>
          
          {contactsExpanded && (
            <div className="mt-4">
              <CompanyContacts
                companyId={company.id}
                contacts={contacts}
                onContactsChange={loadContacts}
              />
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger />
        {isEditing && (
          <CompanyEditDialog
            company={company}
            onUpdate={onEdit}
            onClose={handleCloseEdit}
          />
        )}
      </Dialog>
    </Card>
  );
}
