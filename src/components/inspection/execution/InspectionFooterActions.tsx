
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InspectionFooterActionsProps {
  inspection: any;
  saving: boolean;
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  stats: {
    total: number;
    completed: number;
    required: number;
    requiredCompleted: number;
    percentage: number;
  };
}

export function InspectionFooterActions({
  inspection,
  saving,
  onSaveProgress,
  onCompleteInspection,
  stats
}: InspectionFooterActionsProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [completingInspection, setCompletingInspection] = useState(false);
  
  const isCompleted = inspection.status === "Concluído";
  const canComplete = stats.requiredCompleted === stats.required && stats.required > 0;
  const hasUnansweredRequired = stats.required > 0 && stats.requiredCompleted < stats.required;
  
  const handleCompleteInspection = async () => {
    setCompletingInspection(true);
    
    try {
      await onCompleteInspection();
    } catch (error) {
      console.error("Error completing inspection:", error);
    } finally {
      setCompletingInspection(false);
      setConfirmDialogOpen(false);
    }
  };
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {hasUnansweredRequired && (
            <div className="flex items-center gap-1.5 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                <strong>{stats.required - stats.requiredCompleted}</strong> perguntas obrigatórias não respondidas
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onSaveProgress}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Progresso
              </>
            )}
          </Button>
          
          {!isCompleted && (
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={!canComplete || saving}
              className={canComplete ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Inspeção
            </Button>
          )}
        </div>
      </div>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar inspeção</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja finalizar esta inspeção? 
              {stats.completed < stats.total && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm">
                  <strong className="text-amber-800">Atenção:</strong> Há {stats.total - stats.completed} perguntas sem resposta.
                  {hasUnansweredRequired ? (
                    <span className="text-red-600 block mt-1">
                      Você não pode finalizar a inspeção com perguntas obrigatórias sem resposta.
                    </span>
                  ) : (
                    <span className="block mt-1">
                      Todas as perguntas obrigatórias foram respondidas, então você pode finalizar a inspeção.
                    </span>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completingInspection}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCompleteInspection();
              }}
              disabled={completingInspection || hasUnansweredRequired}
            >
              {completingInspection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                "Finalizar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
