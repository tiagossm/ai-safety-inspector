
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, PencilIcon, ClipboardList, Zap, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import { jsPDF } from "jspdf";
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";

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

const isMatriz = (cnpj: string) => {
  // Remove caracteres não numéricos
  const cleanCnpj = cnpj.replace(/\D/g, '');
  // Verifica se termina com 0001
  return cleanCnpj.substring(8, 12) === '0001';
};

export function CompanyCard({
  company,
  onDelete,
  onEdit,
  onStartInspection,
  onViewLegalNorms,
}: CompanyCardProps) {
  const [unitsExpanded, setUnitsExpanded] = useState(false);
  const units = company.metadata?.units as any[] || [];

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório da Empresa", 20, 20);
    
    // Informações da empresa
    doc.setFontSize(12);
    doc.text(`Nome: ${company.fantasy_name || "Não informado"}`, 20, 40);
    doc.text(`CNPJ: ${company.cnpj}`, 20, 50);
    doc.text(`CNAE: ${company.cnae || "Não informado"}`, 20, 60);
    doc.text(`Tipo: ${isMatriz(company.cnpj) ? "Matriz" : "Filial"}`, 20, 70);
    doc.text(`Funcionários: ${company.employee_count || "Não informado"}`, 20, 80);
    
    // Unidades
    doc.text("Unidades:", 20, 100);
    units.forEach((unit: any, index: number) => {
      doc.text(`- ${unit.name || `Unidade ${index + 1}`}`, 30, 110 + (index * 10));
    });
    
    // Salvar o PDF
    doc.save(`relatorio_${company.cnpj}.pdf`);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">
              {company.fantasy_name || "Nome não informado"}
            </CardTitle>
            <Badge variant={isMatriz(company.cnpj) ? "default" : "secondary"}>
              {isMatriz(company.cnpj) ? "Matriz" : "Filial"}
            </Badge>
          </div>
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUnitsExpanded(!unitsExpanded)}
            >
              {unitsExpanded ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              {units.length} Unidades
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={generatePDF}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
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
          {units.length > 0 && unitsExpanded && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Unidades Vinculadas:</h4>
              {units.map((unit: any, index: number) => (
                <div key={index} className="pl-4 border-l-2 border-muted">
                  <p className="font-medium">{unit.name || `Unidade ${index + 1}`}</p>
                  {unit.address && <p className="text-xs">{unit.address}</p>}
                </div>
              ))}
            </div>
          )}
          <p>Data de cadastro: {new Date(company.created_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
