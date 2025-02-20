
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Company } from "@/types/company";
import { CompanyDetails } from "./company/CompanyDetails";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyCardHeader } from "./company/cards/CompanyCardHeader";
import { CompanyActions } from "./company/cards/CompanyActions";
import { CompanyDeleteDialog } from "./company/cards/CompanyDeleteDialog";
import { CompanyDetailDialog } from "./company/cards/CompanyDetailDialog";
import { CompanyAssistantDialog } from "./company/cards/CompanyAssistantDialog";

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
  const [selectedAssistant, setSelectedAssistant] = useState("default");
  const [assistants, setAssistants] = useState<Array<{ id: string, name: string }>>([]);
  const [loadingAssistants, setLoadingAssistants] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewDetails = () => {
    setShowDetailsDialog(true);
  };

  const handleStartInspection = () => {
    navigate(`/companies/${company.id}/inspections/new`);
  };

  const handleDimensionNRs = async () => {
    setShowAssistantDialog(true);
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
          assistantId: selectedAssistant === "default" ? undefined : selectedAssistant
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
              <CompanyCardHeader company={company} />
            </div>
            <CompanyActions
              onEdit={onEdit}
              onDelete={() => setShowDeleteDialog(true)}
              onStartInspection={handleStartInspection}
              onAnalyze={handleDimensionNRs}
              analyzing={dimensioningNRs}
            />
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

      <CompanyDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={onDelete}
      />

      <CompanyDetailDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        company={company}
      />

      <CompanyAssistantDialog
        open={showAssistantDialog}
        onOpenChange={setShowAssistantDialog}
        selectedAssistant={selectedAssistant}
        onAssistantChange={setSelectedAssistant}
        onAnalyze={handleAnalyzeWithAssistant}
        assistants={assistants}
        loading={loadingAssistants}
        analyzing={dimensioningNRs}
        onLoad={loadAssistants}
      />
    </>
  );
};
