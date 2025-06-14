
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { handleError } from "@/utils/errorHandling";
import { useCreateInspection } from "@/hooks/inspection/useCreateInspection";

interface UseChecklistActionsProps {
  id: string | undefined;
  setIsSubmitting: (isSubmitting: boolean) => void;
  handleSubmit: () => Promise<boolean>;
}

export function useChecklistActions({
  id,
  setIsSubmitting,
  handleSubmit,
}: UseChecklistActionsProps) {
  const navigate = useNavigate();
  const { createInspection } = useCreateInspection();

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const success = await handleSubmit();
      setIsSubmitting(false);
      
      if (success) {
        return true;
      }
      return false;
    } catch (error) {
      setIsSubmitting(false);
      handleError(error instanceof Error ? error : new Error(String(error)), "Erro ao salvar o checklist");
      return false;
    }
  }, [handleSubmit, setIsSubmitting]);
  
  const handleStartInspection = useCallback(async () => {
    if (!id) {
      toast.error("É preciso salvar o checklist antes de iniciar uma inspeção");
      return false;
    }

    setIsSubmitting(true);
    try {
      toast.info("Salvando o checklist...");
      const success = await handleSubmit();
      
      if (!success) {
        toast.error("Erro ao preparar inspeção: Não foi possível salvar o checklist.");
        return false;
      }
      
      toast.info("Criando nova inspeção...");
      const inspectionResult = await createInspection({ checklistId: id });

      if (inspectionResult && inspectionResult.id) {
        console.log(`Inspeção criada com ID: ${inspectionResult.id}. Redirecionando...`);
        toast.success("Inspeção criada com sucesso! Redirecionando...");
        navigate(`/inspections/${inspectionResult.id}/view`);
        return true;
      }
      
      toast.error("Ocorreu um erro ao criar a inspeção.");
      return false;

    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), "Erro ao iniciar a inspeção");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [id, handleSubmit, createInspection, navigate, setIsSubmitting]);

  return { handleSave, handleStartInspection };
}
