
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, PencilIcon, ClipboardList, Zap } from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type Company = {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  employee_count: number | null;
  metadata: Json | null;
  created_at: string;
};

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
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {company.fantasy_name || "Nome não informado"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStartInspection(company)}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Iniciar Inspeção
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewLegalNorms(company)}
            >
              <Zap className="h-4 w-4 mr-2" />
              Dimensione NRs com IA
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                {/* O conteúdo do diálogo será renderizado pelo CompanyEditDialog */}
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost">
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
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Arquivar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>CNPJ: {company.cnpj}</p>
          <p>CNAE: {company.cnae || "Não informado"}</p>
          {company.employee_count && (
            <p>Funcionários: {company.employee_count}</p>
          )}
          {company.contact_email && <p>Email: {company.contact_email}</p>}
          {company.contact_phone && <p>Telefone: {company.contact_phone}</p>}
          {company.metadata && typeof company.metadata === 'object' && 'units' in company.metadata && Array.isArray(company.metadata.units) && (
            <p>Unidades: {company.metadata.units.length}</p>
          )}
          <p>Data de cadastro: {new Date(company.created_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
