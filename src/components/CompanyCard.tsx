import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Company, Contact } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Download, MoreVertical, ChevronDown, ChevronUp, Pencil, Trash2, User, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, DropdownMenu } from "@/components/ui";

interface CompanyCardProps {
  company: Company;
  onToggleStatus: (id: string, newStatus: 'ativo' | 'inativo') => void;
  onEdit: (company: Company) => void;
  onStartInspection: (company: Company) => void;
  onDimensionNRs: (company: Company) => void;
}

const StatusBadge = ({ status }: { status: string }) => (
  <Badge 
    className={cn(
      "gap-2 px-3 py-1 text-sm",
      status === 'ativo' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
    )}
  >
    <div className={cn("h-2 w-2 rounded-full", status === 'ativo' ? 'bg-green-500' : 'bg-red-500')} />
    {status.toUpperCase()}
  </Badge>
);

export function CompanyCard({ company, onToggleStatus, onEdit, onStartInspection, onDimensionNRs }: CompanyCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const loadContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', company.id);
    if (data) setContacts(data);
  };

  const handleToggleStatus = () => {
    const newStatus = company.status === 'ativo' ? 'inativo' : 'ativo';
    onToggleStatus(company.id, newStatus);
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  return (
    <Card 
      className="relative bg-gray-800 text-white rounded-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{company.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={company.status} />
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
                    className="text-red-500 hover:bg-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {company.status === 'ativo' ? 'Inativar' : 'Reativar'}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirmar {company.status === 'ativo' ? 'Inativação' : 'Reativação'}
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      className={company.status === 'ativo' ? 'bg-red-500' : 'bg-green-500'}
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
        <CardContent className="pt-4 border-t border-gray-600">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <span className="text-sm text-gray-400">Data Cadastro:</span>
              <p>{new Date(company.created_at).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-400">Email:</span>
              <p>{company.email || 'Não informado'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Contatos</h3>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={async (e) => {
                  e.stopPropagation();
                  await loadContacts();
                }}
              >
                Atualizar
              </Button>
            </div>
            
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                <User className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <div className="flex gap-2 text-sm text-gray-400">
                    {contact.phone && <span><Phone className="inline h-4 w-4 mr-1" />{contact.phone}</span>}
                    {contact.email && <span><Mail className="inline h-4 w-4 mr-1" />{contact.email}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Button 
              variant="default" 
              onClick={(e) => {
                e.stopPropagation();
                onStartInspection(company);
              }}
              className="min-w-[160px] bg-green-600"
            >
              <ClipboardList className="h-4 w-4 mr-2" /> Iniciar Inspeção
            </Button>
            <Button 
              variant="secondary" 
              onClick={(e) => {
                e.stopPropagation();
                onDimensionNRs(company);
              }}
              className="min-w-[160px] bg-blue-600"
            >
              <Zap className="h-4 w-4 mr-2" /> Dimensionar NRs
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}