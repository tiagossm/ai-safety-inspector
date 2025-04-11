
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Check, RefreshCw, FileText, ClipboardList } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface InspectionHeaderProps {
  inspection: any;
  company: any;
  responsible: any;
  saving: boolean;
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  onReopenInspection: () => Promise<void>;
  onViewActionPlan?: () => Promise<void>;
  onGenerateReport?: () => Promise<void>;
  refreshData: () => Promise<void>;
  stats: any;
}

export function InspectionHeader({
  inspection,
  company,
  responsible,
  saving,
  autoSave,
  setAutoSave,
  onSaveProgress,
  onCompleteInspection,
  onReopenInspection,
  onViewActionPlan,
  onGenerateReport,
  refreshData,
  stats
}: InspectionHeaderProps) {
  const isCompleted = inspection?.status === "completed";
  
  return (
    <div className="border-b pb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{inspection?.title}</h1>
          <p className="text-gray-600">{inspection?.description}</p>
          <div className="flex items-center gap-4 mt-2">
            {company && <span className="text-sm">Empresa: {company.name || company.fantasy_name}</span>}
            {responsible && <span className="text-sm">Responsável: {responsible.name}</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 mr-4">
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
            <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveProgress}
            disabled={saving || isCompleted}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            <span>Salvar</span>
          </Button>
          
          {isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onReopenInspection}
              disabled={saving}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              <span>Reabrir</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onCompleteInspection}
              disabled={saving || stats?.answeredQuestions < stats?.totalQuestions}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              <span>Finalizar</span>
            </Button>
          )}
          
          {isCompleted && (
            <>
              {onViewActionPlan && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onViewActionPlan}
                  className="flex items-center gap-1"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Plano de Ação</span>
                </Button>
              )}
              
              {onGenerateReport && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onGenerateReport}
                  className="flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  <span>Relatório</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
