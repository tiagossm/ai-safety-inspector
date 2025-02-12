
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { CompanyEditDialog } from "@/components/CompanyEditDialog";
import { Company, CompanyMetadata, Contact } from "@/types/company";
import { CompanyDetails } from "@/components/company/CompanyDetails";
import { CompanyUnits } from "@/components/company/CompanyUnits";
import { CompanyContacts } from "@/components/company/CompanyContacts";
import { generateCSV } from "@/utils/companyUtils";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Zap, Download, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

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

  const getStatusDisplay = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                {company.fantasy_name || "Nome não informado"}
              </h2>
              <Badge 
                variant="outline" 
                className={cn(
                  "px-3 py-1 text-sm font-medium transition-colors duration-300",
                  getStatusColor(company.status || '')
                )}
              >
                {getStatusDisplay(company.status)}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-end">
            <Button
              variant="default"
              size="sm"
              onClick={() => onStartInspection(company)}
              className="bg-primary hover:bg-primary/90 transition-colors duration-300 min-w-[160px]"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Iniciar Inspeção
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewLegalNorms(company)}
              className="hover:bg-secondary/90 transition-colors duration-300 min-w-[160px]"
            >
              <Zap className="h-4 w-4 mr-2" />
              Dimensione NRs com IA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateCSV(company, units)}
              className="hover:bg-gray-100/10 transition-colors duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            <CompanyDetails company={company} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Unidades</h3>
            <CompanyUnits units={units} expanded={unitsExpanded} />
            
            <Button
              variant="outline"
              onClick={() => setUnitsExpanded(!unitsExpanded)}
              className="w-full transition-colors duration-300"
            >
              {unitsExpanded ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              {units.length === 0 
                ? "Selecione ou adicione uma unidade" 
                : `${units.length} Unidade${units.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setContactsExpanded(!contactsExpanded)}
            className="w-full transition-colors duration-300"
          >
            {contactsExpanded ? "Ocultar Contatos" : "Ver Contatos"}
          </Button>
          
          {contactsExpanded && (
            <div className="animate-fade-in">
              <CompanyContacts
                companyId={company.id}
                contacts={contacts}
                onContactsChange={loadContacts}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="hover:bg-gray-100/10 transition-colors duration-300 p-3"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost"
                size="sm"
                className="hover:bg-red-500/10 transition-colors duration-300 p-3"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja arquivar esta empresa? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(company.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors duration-300"
                >
                  Arquivar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
