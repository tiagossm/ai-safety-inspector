
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, ClipboardList, Pencil, Trash2, User,
  Mail, Phone, Copy, Zap, PlusCircle, Contact2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Company } from "@/types/company";
import { generateCompanyPDF } from "@/utils/pdfGenerator";
import { formatCNPJ, formatPhone } from "@/utils/formatters";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onAddUnit: () => void;
}

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  isPrimary: boolean;
};

export const CompanyCard = ({ 
  company,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddUnit
}: CompanyCardProps) => {
  const [isInactive, setIsInactive] = useState(company.status === "inactive");
  const [copied, setCopied] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<ContactFormData>();

  const handleCopyEmail = () => {
    if (company.contact_email) {
      navigator.clipboard.writeText(company.contact_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleInactive = () => {
    setIsInactive(!isInactive);
    onToggleStatus();
  };

  const onSubmitContact = async (data: ContactFormData) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          company_id: company.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          is_primary: data.isPrimary
        });

      if (error) throw error;

      toast({
        title: "Contato adicionado",
        description: "O contato foi adicionado com sucesso."
      });

      setIsAddingContact(false);
      reset();
    } catch (error) {
      toast({
        title: "Erro ao adicionar contato",
        description: "Não foi possível adicionar o contato.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-background text-foreground rounded-lg border border-border hover:shadow-md transition-shadow">
      <CardHeader className="border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{company.fantasy_name}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="font-mono">
              CNPJ: {formatCNPJ(company.cnpj)}
            </Badge>
            {company.cnae && <Badge variant="outline">CNAE: {company.cnae}</Badge>}
            <Badge variant="secondary" className="font-mono">
              Grau de Risco: {company.metadata?.risk_grade || '1'}
            </Badge>
            <Badge 
              className={cn(
                "text-sm",
                isInactive
                  ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400"
                  : "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
              )}
            >
              {isInactive ? "Inativo" : "Ativo"}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar Empresa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Empresa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Seção de Contatos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contatos</h3>
            <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Contato
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Contato</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-4">
                  <div className="space-y-2">
                    <Input placeholder="Nome" {...register('name', { required: true })} />
                    <Input type="email" placeholder="Email" {...register('email', { required: true })} />
                    <Input placeholder="Telefone" {...register('phone', { required: true })} />
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isPrimary" {...register('isPrimary')} />
                      <label htmlFor="isPrimary">Contato Principal</label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Salvar Contato</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Contato Principal */}
            {company.contact_name && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Avatar>
                  <AvatarFallback>{company.contact_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{company.contact_name}</span>
                    <Badge variant="outline">Focal</Badge>
                  </div>
                  {company.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${company.contact_email}`} className="hover:underline">
                        {company.contact_email}
                      </a>
                    </div>
                  )}
                  {company.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{formatPhone(company.contact_phone)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
          <Button className="flex-1">
            <ClipboardList className="h-4 w-4 mr-2" />
            Nova Inspeção
          </Button>
          <Button variant="secondary" className="flex-1">
            <Zap className="h-4 w-4 mr-2" />
            Dimensionar NRs
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => generateCompanyPDF(company)}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
