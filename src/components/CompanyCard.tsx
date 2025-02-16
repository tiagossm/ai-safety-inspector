"use client";
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
import {
  ClipboardList,
  Zap,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Controla a abertura do modal de edição
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para armazenar possíveis erros do Supabase
  const [loadError, setLoadError] = useState<string | null>(null);

  const metadata = company.metadata as CompanyMetadata | null;
  const units = metadata?.units || [];

  useEffect(() => {
    if (contactsExpanded) {
      loadContacts();
    }
  }, [contactsExpanded, company.id]);

  const loadContacts = async () => {
    setLoadError(null); // resetando erro
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
    } else if (data) {
      setContacts(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-red-500";
      case "potential":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      {/* Card principal */}
      <Card className="hover:shadow-lg transition-shadow duration-300 max-w-4xl mx-auto bg-white text-black">
        <CardHeader className="pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              {company.fantasy_name || "Nome não informado"}
            </h2>
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors duration-300",
                getStatusColor(company.status || "")
              )}
            >
              {company.status
                ? company.status.charAt(0).toUpperCase() + company.status.slice(1)
                : "Unknown"}
            </Badge>
          </div>

          {/* Menu de opções ⋮ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 cursor-pointer" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Opção de Edição */}
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                ✏️ Editar Empresa
              </DropdownMenuItem>

              {/* Opção de Arquivamento (Exclusão) */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-500">
                    🗑️ Arquivar Empresa
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar arquivamento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja arquivar esta empresa? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(company.id)}
                      className="bg-red-500 text-white"
                    >
                      Arquivar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Detalhes da Empresa */}
          <CompanyDetails company={company} />

          {/* Unidades da Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Unidades</h3>
            <CompanyUnits units={units} expanded={unitsExpanded} />
            <Button
              variant="outline"
              onClick={() => setUnitsExpanded(!unitsExpanded)}
              className="w-full"
            >
              {unitsExpanded ? (
                <ChevronUp className="h-5 w-5 mr-2" />
              ) : (
                <ChevronDown className="h-5 w-5 mr-2" />
              )}
              {unitsExpanded
                ? "Ocultar Unidades"
                : `Exibir ${units.length || "0"} Unidades`}
            </Button>
          </div>

          {/* Contatos da Empresa */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setContactsExpanded(!contactsExpanded)}
              className="w-full"
            >
              {contactsExpanded ? "Ocultar Contatos" : "Ver Contatos"}
            </Button>

            {/* Exibe contatos (ou mensagem de erro) */}
            {contactsExpanded && (
              <>
                {loadError ? (
                  <p className="text-red-600">
                    Erro ao carregar contatos: {loadError}
                  </p>
                ) : (
                  <CompanyContacts
                    companyId={company.id}
                    contacts={contacts}
                    onContactsChange={loadContacts}
                  />
                )}
              </>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant="default"
              onClick={() => onStartInspection(company)}
              className="min-w-[160px]"
            >
              <ClipboardList className="h-4 w-4 mr-2" /> Iniciar Inspeção
            </Button>
            <Button
              variant="secondary"
              onClick={() => onViewLegalNorms(company)}
              className="min-w-[160px]"
            >
              <Zap className="h-4 w-4 mr-2" /> Dimensione NRs com IA
            </Button>
            <Button
              variant="outline"
              onClick={() => generateCSV(company, units)}
            >
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Empresa */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <CompanyEditDialog
            company={company}
            onClose={() => setIsEditing(false)}
            onSave={(updatedCompany) => {
              onEdit(updatedCompany);
              setIsEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
