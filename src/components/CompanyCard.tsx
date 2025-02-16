import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Company, CompanyStatus } from "@/types/company";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface CompanyCardProps {
  company: Company;
  onToggleStatus: (id: string, newStatus: CompanyStatus) => void;
  onEdit: (company: Company) => void;
  onStartInspection: (company: Company) => void;
  onDimensionNRs: (company: Company) => void;
}

const StatusBadge = ({ status }: { status: CompanyStatus }) => (
  <Badge 
    variant="outline"
    className={cn(
      "gap-2 px-3 py-1 text-sm",
      status === 'active' 
        ? 'bg-success/20 text-success border-success/30' 
        : 'bg-destructive/20 text-destructive border-destructive/30'
    )}
  >
    <div className={cn(
      "h-2 w-2 rounded-full",
      status === 'active' ? 'bg-success' : 'bg-destructive'
    )} />
    {status.toUpperCase()}
  </Badge>
);

export function CompanyCard({ company, onToggleStatus, onEdit, onStartInspection, onDimensionNRs }: CompanyCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleStatus = () => {
    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    onToggleStatus(company.id, newStatus);
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  return (
    <Card 
      className={cn(
        "relative rounded-lg transition-shadow w-full",
        "bg-card text-card-foreground border border-border",
        "hover:shadow-md cursor-pointer"
      )}
      onClick={() => setShowDetails(!showDetails)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold truncate">{company.fantasy_name}</h2>
              <StatusBadge status={company.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              CNPJ: {formatCNPJ(company.cnpj)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-popover text-popover-foreground border-border"
              align="end"
            >
              <DropdownMenuItem 
                className="hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(company);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar Empresa
              </DropdownMenuItem>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive hover:bg-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {company.status === 'active' ? 'Inativar' : 'Reativar'}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-popover text-popover-foreground">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirmar {company.status === 'active' ? 'Inativação' : 'Reativação'}
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      className={cn(
                        company.status === 'active' 
                          ? 'bg-destructive text-destructive-foreground' 
                          : 'bg-success text-success-foreground'
                      )}
                      onClick={handleToggleStatus}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-4 border-t border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">CNAE</span>
                <span className="font-medium">{company.cnae || 'Não informado'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="font-medium">{company.contact_email || 'Não informado'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Telefone</span>
                <span className="font-medium">{company.phone || 'Não informado'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Data Cadastro</span>
                <span className="font-medium">
                  {new Date(company.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onStartInspection(company);
              }}
              className="flex-1"
            >
              <ClipboardList className="h-4 w-4 mr-2" /> 
              Nova Inspeção
            </Button>
            
            <Button 
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onDimensionNRs(company);
              }}
              className="flex-1"
            >
              <BrainCircuit className="h-4 w-4 mr-2" />
              Dimensionar NRs
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}