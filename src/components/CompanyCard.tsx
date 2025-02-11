import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, PencilIcon, ClipboardList, Zap, Printer, ChevronDown, ChevronUp, Download } from "lucide-react";
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
import { CompanyEditDialog } from "@/components/CompanyEditDialog";

type CompanyMetadata = {
  units?: Array<{
    name?: string;
    address?: string;
  }>;
}

type Company = {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
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
  const [isEditing, setIsEditing] = useState(false);
  const metadata = company.metadata as CompanyMetadata | null;
  const units = metadata?.units || [];

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
    units.forEach((unit, index) => {
      doc.text(`- ${unit.name || `Unidade ${index + 1}`}`, 30, 110 + (index * 10));
    });
    
    // Salvar o PDF
    doc.save(`relatorio_${company.cnpj}.pdf`);
  };

  const generateCSV = () => {
    // Create CSV content
    let csvContent = "Nome,CNPJ,CNAE,Tipo,Funcionários\n";
    csvContent += `${company.fantasy_name || ""},${company.cnpj},${company.cnae || ""},${isMatriz(company.cnpj) ? "Matriz" : "Filial"},${company.employee_count || ""}\n`;
    
    // Add units
    units.forEach(unit => {
      csvContent += `${unit.name || ""},${unit.cnpj || ""},${unit.cnae || ""},"Unidade",\n`;
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `empresa_${company.cnpj}_relatorio.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEdit(company);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
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
              onClick={generateCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              {isEditing && (
                <CompanyEditDialog
                  company={company}
                  onUpdate={onEdit}
                  onClose={handleCloseEdit}
                />
              )}
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
          {company.contact_name && <p>Contato: {company.contact_name}</p>}
          {units.length > 0 && unitsExpanded && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Unidades Vinculadas:</h4>
              {units.map((unit, index) => (
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
