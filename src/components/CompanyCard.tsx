
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Company, CompanyStatus } from "@/types/company";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Download, MoreVertical, ChevronDown, ChevronUp, Pencil, Trash2, User, Mail, Phone } from "lucide-react";
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

const getStatusColor = (status: CompanyStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'inactive':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

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
    <Card className="bg-gray-800 text-white rounded-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{company.fantasy_name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(company.status)}`} />
              <span className="text-sm font-medium">{company.status.toUpperCase()}</span>
              <span className="text-sm text-gray-400">
                CNPJ: {formatCNPJ(company.cnpj)}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-700 text-white border-gray-600">
              <DropdownMenuItem 
                className="hover:bg-gray-600"
                onClick={() => onEdit(company)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar Empresa
              </DropdownMenuItem>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-500 hover:bg-gray-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {company.status === 'active' ? 'Inativar' : 'Reativar'}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirmar {company.status === 'active' ? 'Inativação' : 'Reativação'}
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      className={company.status === 'active' ? 'bg-red-500' : 'bg-green-500'}
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

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-400">CNAE:</span>
            <p>{company.cnae || 'Não informado'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Email:</span>
            <p>{company.contact_email || 'Não informado'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="default" 
            onClick={() => onStartInspection(company)}
            className="bg-green-600"
          >
            <ClipboardList className="h-4 w-4 mr-2" /> 
            Iniciar Inspeção
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => onDimensionNRs(company)}
            className="bg-blue-600"
          >
            <Download className="h-4 w-4 mr-2" /> 
            Dimensionar NRs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
