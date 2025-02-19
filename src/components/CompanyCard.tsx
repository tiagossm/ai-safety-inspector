
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, ClipboardList, Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Company } from "@/types/company";
import { CompanyDetails } from "./company/CompanyDetails";
import { CompanyContacts } from "./company/CompanyContacts";
import { CompanyUnits } from "./company/CompanyUnits";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onAddUnit: () => void;
}

export const CompanyCard = ({ 
  company,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddUnit
}: CompanyCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isInactive = company.status === "inactive";

  return (
    <Card className="w-full bg-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold leading-none">
                {company.fantasy_name}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline" className="font-mono">
                CNPJ: {company.cnpj}
              </Badge>
              {company.cnae && (
                <Badge variant="outline">
                  CNAE: {company.cnae}
                </Badge>
              )}
              <Badge 
                className={cn(
                  isInactive
                    ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400"
                    : "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
                )}
              >
                {isInactive ? "Inativo" : "Ativo"}
              </Badge>
            </div>
            {company.contact_email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${company.contact_email}`} className="hover:text-primary">
                  {company.contact_email}
                </a>
              </div>
            )}
            {company.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{company.contact_phone}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar Empresa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Empresa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <CompanyDetails company={company} />
            <CompanyContacts company={company} />
          </div>
          <div className="space-y-6">
            <CompanyUnits company={company} />
            <div className="flex gap-2">
              <Button onClick={onAddUnit} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Nova Unidade
              </Button>
              <Button variant="secondary" className="flex-1">
                <MapPin className="h-4 w-4 mr-2" />
                Ver no Mapa
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
