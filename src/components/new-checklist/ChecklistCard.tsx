
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { 
  Clipboard, 
  Edit2, 
  Trash2, 
  Copy, 
  FileCheck, 
  Send, 
  Printer,
  Download,
  Building2,
  ToggleLeft,
  ToggleRight,
  Bot,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats } from "@/types/newChecklist";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { exportChecklistToPDF, exportChecklistToCSV, shareChecklistViaWhatsApp, printChecklist } from "@/utils/pdfExport";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onOpen?: (id: string) => void;
  onStatusChange?: () => void;
}

export function ChecklistCard({
  checklist,
  onEdit,
  onDelete,
  onDuplicate,
  onOpen,
  onStatusChange
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

  // Company name
  const [companyName, setCompanyName] = React.useState<string | null>(null);

  // Fetch company name if we have companyId
  React.useEffect(() => {
    if (checklist.companyId) {
      fetchCompanyName(checklist.companyId);
    }
  }, [checklist.companyId]);

  const fetchCompanyName = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('fantasy_name')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      if (data) {
        setCompanyName(data.fantasy_name);
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };
  
  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      const newStatus = checklist.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('checklists')
        .update({ status: newStatus })
        .eq('id', checklist.id);
        
      if (error) throw error;
      
      toast.success(`Checklist ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("Error toggling checklist status:", error);
      toast.error("Erro ao alterar status do checklist");
    }
  };

  // Handle inspection start
  const handleStartInspection = () => {
    // Navigate to the new inspection page - always allow inspection to start
    if (checklist.id) {
      navigate(`/inspections/new/${checklist.id}`);
      toast.info(`Preparando inspeção com o checklist: ${checklist.title}`);
    } else {
      toast.error("ID do checklist inválido");
    }
  };

  // Handle export options
  const handleExportPDF = async () => {
    try {
      toast.info("Exportando para PDF...");
      await exportChecklistToPDF(checklist);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error("PDF export error:", error);
    }
  };

  const handleExportCSV = () => {
    try {
      toast.info("Exportando para CSV...");
      exportChecklistToCSV(checklist);
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
      console.error("CSV export error:", error);
    }
  };

  const handlePrint = () => {
    toast.info("Preparando impressão...");
    printChecklist();
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Checklist: ${checklist.title}`);
    const body = encodeURIComponent(`Confira este checklist: ${checklist.title}\n\n${window.location.origin}/checklists/${checklist.id}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.info("Preparando para compartilhar por email...");
  };

  const handleShareWhatsapp = () => {
    shareChecklistViaWhatsApp(checklist);
    toast.info("Compartilhando via WhatsApp...");
  };

  // Determine if this was created by AI (based on metadata or description patterns)
  const isAIGenerated = checklist.description?.includes("Gerado por IA") || 
                        checklist.description?.includes("criado com Inteligência Artificial") ||
                        false; // Add your own detection logic here

  // Truncate description for display
  const maxDescriptionLength = 120;
  const truncatedDescription = checklist.description && checklist.description.length > maxDescriptionLength 
    ? `${checklist.description.substring(0, maxDescriptionLength)}...` 
    : checklist.description;
  
  return (
    <Card className={`h-full flex flex-col transition-shadow hover:shadow-md ${checklist.status === 'inactive' ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-1.5 items-center">
            {isAIGenerated && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-purple-50 border-purple-200">
                      <Bot className="h-3 w-3 mr-1 text-purple-500" />
                      <span className="text-purple-700 text-xs">IA</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Checklist gerado por IA</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <h3 className="text-lg font-semibold line-clamp-2">{checklist.title}</h3>
          </div>
          <div className="flex gap-1">
            {checklist.isTemplate && (
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">Template</Badge>
            )}
          </div>
        </div>
        
        {companyName && (
          <div className="flex items-center text-sm font-medium text-foreground mt-1">
            <Building2 className="h-3.5 w-3.5 mr-1 text-primary" />
            <span className="truncate max-w-[200px]">{companyName}</span>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mt-1">
          Criado em {formattedDate}
        </p>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {truncatedDescription ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm line-clamp-3 text-gray-600 mb-3">
                  {truncatedDescription}
                </p>
              </TooltipTrigger>
              {checklist.description && checklist.description.length > maxDescriptionLength && (
                <TooltipContent side="bottom" align="start" className="max-w-sm">
                  <p className="text-sm">{checklist.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <p className="text-sm line-clamp-3 text-gray-600 mb-3">
            Sem descrição
          </p>
        )}
        
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
          {checklist.id ? (
            <Button 
              variant="default" 
              size="sm"
              className="w-full bg-teal-600 hover:bg-teal-700" 
              onClick={handleStartInspection}
            >
              <FileCheck className="h-4 w-4 mr-1" />
              Iniciar inspeção
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full"
              disabled
            >
              <FileCheck className="h-4 w-4 mr-1" />
              ID do checklist não fornecido
            </Button>
          )}
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
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleToggleStatus}
                  >
                    {checklist.status === 'active' ? (
                      <ToggleRight className="h-4 w-4 mr-1 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 mr-1 text-gray-400" />
                    )}
                    {checklist.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{checklist.status === 'active' ? 'Desativar checklist' : 'Ativar checklist'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
              >
                <Info className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen && onOpen(checklist.id)}>
                <Clipboard className="h-4 w-4 mr-2" />
                Ver detalhes
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exportar como PDF
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar como CSV
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => onDuplicate && onDuplicate(checklist.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onDelete(checklist.id, checklist.title)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
