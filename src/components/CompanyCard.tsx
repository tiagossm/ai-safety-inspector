import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Pencil, Trash2, Plus, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Company } from "@/types/company";
import { CompanyDetails } from "./company/CompanyDetails";
import { CompanyContacts } from "./company/CompanyContacts";
import { CompanyUnits } from "./company/CompanyUnits";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const isInactive = company.status === "inactive";
  const handleViewDetails = () => {
    navigate(`/companies/${company.id}`);
  };
  return <Card className="flex flex-col h-full bg-card hover:shadow-md transition-shadow duration-200">
      <CardHeader className="border-b border-border space-y-4 mx-0 my-[13px] px-0 py-[14px] rounded-full">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <h3 className="text-lg font-semibold leading-none truncate">
                {company.fantasy_name}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {company.cnpj}
              </Badge>
              {company.cnae && <Badge variant="outline" className="text-xs">
                  {company.cnae}
                </Badge>}
              <Badge className={cn("text-xs", isInactive ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400")}>
                {isInactive ? "Inativo" : "Ativo"}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
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

        <div className="space-y-2">
          {company.contact_email && <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${company.contact_email}`} className="hover:text-primary truncate">
                {company.contact_email}
              </a>
            </div>}
          {company.contact_phone && <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{company.contact_phone}</span>
            </div>}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6 flex-1">
        <div className="grid gap-6">
          <CompanyDetails company={company} />
          <CompanyContacts company={company} />
        </div>
        
        <CompanyUnits company={company} />
      </CardContent>

      <div className="p-4 pt-0 mt-auto space-y-2">
        <div className="flex gap-2">
          <Button onClick={onAddUnit} className="flex-1 h-9">
            <Plus className="h-4 w-4 mr-2" />
            Nova Unidade
          </Button>
          <Button variant="secondary" className="flex-1 h-9">
            <MapPin className="h-4 w-4 mr-2" />
            Ver no Mapa
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleViewDetails}>
          Ver Detalhes
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

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
            <AlertDialogAction onClick={() => {
            onDelete();
            setShowDeleteDialog(false);
          }} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>;
};