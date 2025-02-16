
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Company, CompanyStatus, CompanyUnit } from "@/types/company";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  BrainCircuit,
  Printer,
  DownloadCloud
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
import { formatCNPJ, formatPhone } from "@/utils/formatters";

interface CompanyCardProps {
  company: Company;
  onToggleStatus: (id: string, newStatus: CompanyStatus) => void;
  onEdit: (company: Company) => void;
  onStartInspection: (company: Company) => void;
  onDimensionNRs: (company: Company) => void;
}

const InfoItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex justify-between items-center py-1 border-b border-border">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || 'Não informado'}</span>
  </div>
);

export function CompanyCard({ company, onToggleStatus, onEdit, onStartInspection, onDimensionNRs }: CompanyCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleStatus = () => {
    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    onToggleStatus(company.id, newStatus);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card 
      className={cn(
        "relative rounded-lg transition-shadow w-full",
        "bg-card text-card-foreground border border-border",
        "hover:shadow-md"
      )}
      onClick={() => setShowDetails(!showDetails)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold">{company.fantasy_name}</h2>
              <Badge variant="outline" className="font-normal">
                {company.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline">CNPJ: {formatCNPJ(company.cnpj)}</Badge>
              {company.cnae && <Badge variant="outline">CNAE: {company.cnae}</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePrint();
              }}
            >
              <Printer className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(company);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar Empresa
                </DropdownMenuItem>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {company.status === 'active' ? 'Inativar' : 'Reativar'}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirmar {company.status === 'active' ? 'Inativação' : 'Reativação'}
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleToggleStatus}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <InfoItem 
                label="Grau de Risco (NR 4)" 
                value={company.metadata?.risk_grade || null} 
              />
              <InfoItem 
                label="Funcionários" 
                value={company.employee_count?.toString() || null}
              />
            </div>
            <div className="space-y-2">
              <InfoItem label="Contato" value={company.contact_name} />
              <InfoItem label="Email" value={company.contact_email} />
              <InfoItem label="Telefone" value={formatPhone(company.contact_phone)} />
            </div>
          </div>

          {company.metadata?.units && company.metadata.units.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Unidades Cadastradas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {company.metadata.units.map((unit: CompanyUnit) => (
                  <div key={unit.id} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{unit.name}</p>
                    <p className="text-sm text-muted-foreground">{unit.code}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
