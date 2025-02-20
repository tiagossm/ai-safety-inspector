import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Pencil, Trash2, MapPin, ChevronRight, Info, ClipboardCheck, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Company } from "@/types/company";
import { CompanyDetails } from "./company/CompanyDetails";
import { CompanyContacts } from "./company/CompanyContacts";
import { CompanyUnits } from "./company/CompanyUnits";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onAddUnit: () => void;
}

export const CompanyCard = ({
  company,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddUnit
}: CompanyCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [dimensioningNRs, setDimensioningNRs] = useState(false);
  const [showAssistantDialog, setShowAssistantDialog] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [assistants, setAssistants] = useState<Array<{ id: string, name: string }>>([]);
  const [loadingAssistants, setLoadingAssistants] = useState(false);
  const navigate = useNavigate();
  const isInactive = company.status === "inactive";
  const { toast } = useToast();

  const handleViewDetails = () => {
    setShowDetailsDialog(true);
  };

  const handleStartInspection = () => {
    navigate(`/companies/${company.id}/inspections/new`);
  };

  const handleDimensionNRs = async () => {
    setShowAssistantDialog(true);
    await loadAssistants();
  };

  const handleAnalyzeWithAssistant = async () => {
    setDimensioningNRs(true);
    setShowAssistantDialog(false);
    try {
      const { data, error } = await supabase.functions.invoke('dimension-nrs', {
        body: { 
          cnae: company.cnae,
          companyInfo: {
            fantasyName: company.fantasy_name,
            employeeCount: company.employee_count,
            riskGrade: company.metadata?.risk_grade
          },
          assistantId: selectedAssistant || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Análise de NRs Aplicáveis",
        description: data.analysis,
        duration: 10000,
      });
    } catch (error) {
      toast({
        title: "Erro ao analisar NRs",
        description: "Não foi possível realizar a análise no momento",
        variant: "destructive"
      });
    } finally {
      setDimensioningNRs(false);
    }
  };

  const loadAssistants = async () => {
    setLoadingAssistants(true);
    try {
      const response = await fetch('https://api.openai.com/v1/assistants', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });
      const data = await response.json();
      setAssistants(data.data.map((assistant: any) => ({
        id: assistant.id,
        name: assistant.name
      })));
    } catch (error) {
      console.error('Error loading assistants:', error);
      toast({
        title: "Erro ao carregar assistentes",
        description: "Não foi possível carregar a lista de assistentes da OpenAI",
        variant: "destructive"
      });
    } finally {
      setLoadingAssistants(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full bg-card hover:shadow-md transition-shadow duration-200">
        <CardHeader className="border-b border-border space-y-4 mx-0 my-[13px] px-4 py-[14px]">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <h3 className="text-lg font-semibold leading-none truncate">
                  {company.fantasy_name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {company.cnpj}
                </Badge>
                {company.cnae && (
                  <Badge variant="outline" className="text-xs">
                    {company.cnae}
                  </Badge>
                )}
                <Badge className={cn("text-xs", 
                  isInactive ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400" 
                  : "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
                )}>
                  {isInactive ? "Inativo" : "Ativo"}
                </Badge>
                {company.metadata?.risk_grade && (
                  <Badge variant="secondary" className="text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    Grau de Risco: {company.metadata.risk_grade}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Empresa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Empresa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleStartInspection}
                title="Iniciar Nova Inspeção"
              >
                <ClipboardCheck className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDimensionNRs}
                disabled={dimensioningNRs}
                title="Analisar NRs Aplicáveis"
              >
                <Brain className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {company.contact_email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${company.contact_email}`} className="hover:text-primary truncate">
                  {company.contact_email}
                </a>
              </div>
            )}
            {company.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{company.contact_phone}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-6 flex-1">
          <div className="grid gap-6">
            <CompanyDetails company={company} />
          </div>
        </CardContent>

        <div className="p-4 pt-0 mt-auto space-y-2">
          <Button variant="outline" className="w-full" onClick={handleViewDetails}>
            Ver Detalhes
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onDelete();
              setShowDeleteDialog(false);
            }} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{company.fantasy_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <CompanyDetails company={company} />
            <CompanyContacts company={company} />
            <CompanyUnits company={company} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssistantDialog} onOpenChange={setShowAssistantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Assistente para Análise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              disabled={loadingAssistants}
              value={selectedAssistant}
              onValueChange={setSelectedAssistant}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um assistente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Usar modelo padrão</SelectItem>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssistantDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAnalyzeWithAssistant} disabled={dimensioningNRs}>
                Analisar NRs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
