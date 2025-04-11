
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Save, Check } from "lucide-react";

interface InspectionFooterActionsProps {
  inspection: any;
  saving: boolean;
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  stats: any;
}

export function InspectionFooterActions({
  inspection,
  saving,
  onSaveProgress,
  onCompleteInspection,
  stats
}: InspectionFooterActionsProps) {
  const isCompleted = inspection?.status === "completed";
  const completionPercentage = stats?.completionPercentage || 0;
  const canComplete = completionPercentage === 100 && !isCompleted;
  
  return (
    <div className="border-t pt-4 pb-4 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Progress value={completionPercentage} className="flex-1 h-2" />
        <span className="text-sm font-medium">
          {stats?.answeredQuestions || 0}/{stats?.totalQuestions || 0} ({completionPercentage}%)
        </span>
      </div>
      
      <div className="flex gap-2">
        {!isCompleted && (
          <>
            <Button
              variant="outline"
              disabled={saving}
              onClick={onSaveProgress}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            
            <Button
              variant="default"
              disabled={saving || !canComplete}
              onClick={onCompleteInspection}
              className="flex items-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
