
import React, { useState, useEffect } from "react";
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
import { useChecklistDelete } from "@/hooks/new-checklist/useChecklistDelete";
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteChecklistDialog({
  checklistId,
  checklistTitle,
  isOpen,
  onOpenChange
}: DeleteChecklistDialogProps) {
  const deleteChecklist = useChecklistDelete();
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasRelatedInspections, setHasRelatedInspections] = useState(false);
  const [relatedInspections, setRelatedInspections] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingRelations, setIsCheckingRelations] = useState(false);
  
  // Check for related inspections when dialog opens
  useEffect(() => {
    if (isOpen && checklistId) {
      checkForRelatedInspections();
    } else {
      // Reset state when dialog closes
      setHasRelatedInspections(false);
      setRelatedInspections([]);
      setErrorMessage(null);
    }
  }, [isOpen, checklistId]);
  
  const checkForRelatedInspections = async () => {
    if (!checklistId) return;
    
    setIsCheckingRelations(true);
    
    try {
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from("inspections")
        .select("id, status")
        .eq("checklist_id", checklistId);
        
      if (inspectionsError) {
        console.error("Error checking related inspections:", inspectionsError);
        setErrorMessage("Erro ao verificar inspeções relacionadas");
      } else if (inspectionsData && inspectionsData.length > 0) {
        console.log(`Found ${inspectionsData.length} inspections related to this checklist`);
        setHasRelatedInspections(true);
        setRelatedInspections(inspectionsData);
      }
    } catch (error) {
      console.error("Error in checkForRelatedInspections:", error);
      setErrorMessage("Erro ao verificar relacionamentos");
    } finally {
      setIsCheckingRelations(false);
    }
  };
  
  const handleDeleteWithInspections = async () => {
    if (!checklistId) return;
    
    setIsConfirming(true);
    setErrorMessage(null);
    
    try {
      // First delete related inspections
      for (const inspection of relatedInspections) {
        const { error: responseError } = await supabase
          .from("inspection_responses")
          .delete()
          .eq("inspection_id", inspection.id);
          
        if (responseError) {
          console.error("Error deleting inspection responses:", responseError);
          // Continue with next inspection even if this one fails
        }
      }
      
      // Then delete all inspections
      const { error: inspectionsError } = await supabase
        .from("inspections")
        .delete()
        .eq("checklist_id", checklistId);
        
      if (inspectionsError) {
        console.error("Error deleting related inspections:", inspectionsError);
        throw inspectionsError;
      }
      
      // Finally delete the checklist
      await deleteChecklist.mutateAsync(checklistId);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in DeleteChecklistDialog:", error);
      setErrorMessage(`Erro ao excluir: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsConfirming(false);
    }
  };
  
  const handleDelete = async () => {
    if (!checklistId) return;
    
    if (hasRelatedInspections) {
      // If we have related inspections, use the special delete function
      await handleDeleteWithInspections();
      return;
    }
    
    // Regular delete flow for checklists without related inspections
    setIsConfirming(true);
    setErrorMessage(null);
    
    try {
      await deleteChecklist.mutateAsync(checklistId);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in DeleteChecklistDialog:", error);
      
      // Check if the error is due to related inspections
      if (error.code === '23503' && error.message.includes('inspections')) {
        setHasRelatedInspections(true);
        await checkForRelatedInspections(); // Refresh the inspections data
        setErrorMessage("Este checklist possui inspeções relacionadas. Use a opção 'Excluir tudo' para remover o checklist e suas inspeções.");
      } else {
        setErrorMessage(`Erro ao excluir checklist: ${error.message || "Erro desconhecido"}`);
      }
    } finally {
      setIsConfirming(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir checklist</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              <p>
                Tem certeza que deseja excluir o checklist <strong>"{checklistTitle}"</strong>?
              </p>
              
              {isCheckingRelations && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando dependências...</span>
                </div>
              )}
              
              {hasRelatedInspections && (
                <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-amber-800">
                        Este checklist possui {relatedInspections.length} inspeção(ões) relacionada(s)
                      </p>
                      <p className="text-sm text-amber-700">
                        Para excluir este checklist, todas as inspeções relacionadas também serão excluídas.
                        Isso não pode ser desfeito.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {errorMessage && (
                <div className="bg-red-50 rounded-md p-3 border border-red-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-800">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!hasRelatedInspections && !errorMessage && !isCheckingRelations && (
                <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-blue-800">
                        Esta ação não pode ser desfeita e também removerá todas as perguntas associadas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteChecklist.isPending || isConfirming}>
            Cancelar
          </AlertDialogCancel>
          
          {hasRelatedInspections ? (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteWithInspections();
              }}
              disabled={deleteChecklist.isPending || isConfirming}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir tudo"
              )}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteChecklist.isPending || isConfirming}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Sim, excluir"
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
