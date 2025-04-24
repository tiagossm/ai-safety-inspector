
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Save, 
  CheckCircle2, 
  ArrowLeftRight, 
  FileText, 
  RefreshCw 
} from "lucide-react";
import { toast } from "sonner";

interface ActionButtonsProps {
  loading: boolean;
  saving: boolean;
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  lastSaved: Date | null;
  inspectionStatus?: string;
  completionPercentage: number;
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  onReopenInspection: () => Promise<void>;
  onViewActionPlan: () => void;
  onGenerateReport: () => void;
  refreshData: () => void;
}

export function ActionButtons({ 
  loading, 
  saving, 
  autoSave, 
  setAutoSave, 
  lastSaved, 
  inspectionStatus,
  completionPercentage,
  onSaveProgress, 
  onCompleteInspection, 
  onReopenInspection, 
  onViewActionPlan, 
  onGenerateReport, 
  refreshData 
}: ActionButtonsProps) {
  const handleCompleteInspection = async () => {
    if (completionPercentage < 100) {
      if (!window.confirm("A inspeção não está 100% completa. Deseja finalizar mesmo assim?")) {
        return;
      }
    }
    
    await onCompleteInspection();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center mb-2 justify-between bg-muted/40 p-2 rounded-md">
        <div className="flex items-center space-x-2">
          <Switch
            id="autoSave"
            checked={autoSave}
            onCheckedChange={setAutoSave}
          />
          <Label htmlFor="autoSave" className="text-sm">Auto-salvar</Label>
        </div>
        
        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            Último: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      <Button
        className="w-full text-sm"
        disabled={saving || loading}
        onClick={onSaveProgress}
      >
        {saving ? "Salvando..." : "Salvar Progresso"}
        <Save className="h-3.5 w-3.5 ml-1.5" />
      </Button>
      
      {inspectionStatus !== 'completed' ? (
        <Button
          variant="default"
          className="w-full text-sm"
          disabled={saving || loading}
          onClick={handleCompleteInspection}
        >
          Finalizar Inspeção
          <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full text-sm"
          disabled={saving || loading}
          onClick={onReopenInspection}
        >
          Reabrir Inspeção
          <ArrowLeftRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      )}
      
      <Button
        variant="outline"
        className="w-full text-sm"
        disabled={loading}
        onClick={onViewActionPlan}
      >
        Plano de Ação
      </Button>
      
      <Button
        variant="outline"
        className="w-full text-sm"
        disabled={loading}
        onClick={onGenerateReport}
      >
        <FileText className="h-3.5 w-3.5 mr-1.5" />
        Gerar Relatório
      </Button>
      
      <Button
        variant="outline"
        className="w-full text-sm"
        disabled={loading}
        onClick={refreshData}
      >
        <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
        Atualizar dados
      </Button>
    </div>
  );
}
