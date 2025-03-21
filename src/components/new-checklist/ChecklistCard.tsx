
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clipboard, Edit2, Trash2, Copy, FileCheck, Send, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats } from "@/types/newChecklist";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onOpen?: (id: string) => void;
}

export function ChecklistCard({
  checklist,
  onEdit,
  onDelete,
  onDuplicate,
  onOpen
}: ChecklistCardProps) {
  const navigate = useNavigate();

  // Format created date
  const formattedDate = checklist.createdAt 
    ? new Date(checklist.createdAt).toLocaleDateString() 
    : "Data desconhecida";
  
  // Calculate completion percentage
  const completionPercentage = checklist.totalQuestions 
    ? Math.round((checklist.completedQuestions || 0) / checklist.totalQuestions * 100) 
    : 0;
  
  // Handle inspection start
  const handleStartInspection = () => {
    // Navigate to start a new inspection with this checklist
    navigate(`/inspections/new/${checklist.id}`);
  };

  // Handle export options
  const handleExportPDF = () => {
    toast.info("Exportando para PDF...");
    // Implement PDF export logic
  };

  const handleExportCSV = () => {
    toast.info("Exportando para CSV...");
    // Implement CSV export logic
  };

  const handlePrint = () => {
    toast.info("Preparando impressão...");
    window.print();
  };

  const handleShareEmail = () => {
    toast.info("Preparando para compartilhar por email...");
    // Implement email sharing logic
  };

  const handleShareWhatsapp = () => {
    const url = window.location.origin + `/checklists/${checklist.id}`;
    const text = `Confira este checklist: ${checklist.title}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">{checklist.title}</h3>
          <div className="flex gap-1">
            {checklist.isTemplate && (
              <Badge variant="outline" className="bg-blue-50">Template</Badge>
            )}
            <Badge variant={checklist.status === "active" ? "default" : "secondary"}>
              {checklist.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Criado em {formattedDate}
        </p>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 text-gray-600 mb-3">
          {checklist.description || "Sem descrição"}
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>Categoria:</span>
            <span className="font-medium">{checklist.category || "Geral"}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Perguntas:</span>
            <span className="font-medium">{checklist.totalQuestions || 0}</span>
          </div>
          
          {checklist.totalQuestions > 0 && (
            <div className="flex justify-between text-sm">
              <span>Conclusão:</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col gap-3 border-t">
        <div className="w-full">
          <Button 
            variant="default" 
            size="sm"
            className="w-full bg-teal-600 hover:bg-teal-700" 
            onClick={handleStartInspection}
          >
            <FileCheck className="h-4 w-4 mr-1" />
            Iniciar inspeção
          </Button>
        </div>
        
        <div className="w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar checklist
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Salvar como PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareEmail}>
                <Send className="h-4 w-4 mr-2" />
                Enviar por email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareWhatsapp}>
                <Send className="h-4 w-4 mr-2" />
                Compartilhar via WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(checklist.id)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Editar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(checklist.id, checklist.title)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDuplicate && onDuplicate(checklist.id)}
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
