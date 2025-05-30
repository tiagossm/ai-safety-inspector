import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  deleteInspection as deleteInspectionService, 
  deleteMultipleInspections as deleteMultipleInspectionsService 
} from "@/services/inspection/inspectionService"; // Assuming path and export names
import { toast } from "sonner";
// import { handleApiError } from "@/utils/errorHandling"; // Optional, based on project patterns

/**
 * Hook for inspection mutations (delete single, delete multiple).
 */
export function useInspectionMutations() {
  const queryClient = useQueryClient();

  /**
   * Mutation to delete a single inspection.
   */
  const deleteInspection = useMutation({
    mutationFn: async (inspectionId: string) => {
      const toastId = toast.loading("Excluindo inspeção...");
      try {
        const result = await deleteInspectionService(inspectionId);
        toast.dismiss(toastId);
        toast.success("Inspeção excluída com sucesso");
        return result;
      } catch (error: any) {
        toast.dismiss(toastId);
        // Using generic error message, specific handling can be added if error structure is known
        toast.error("Erro ao excluir inspeção", {
          description: error?.message || "Ocorreu um erro inesperado.",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      // Potentially invalidate other related queries if necessary
      // e.g., queryClient.invalidateQueries({ queryKey: ['inspection-details', inspectionId] }); // If applicable
    },
    // onError: (error: any) => { /* Already handled in mutationFn's catch block */ }
  });

  /**
   * Mutation to delete multiple inspections.
   */
  const deleteMultipleInspections = useMutation({
    mutationFn: async (inspectionIds: string[]) => {
      if (!inspectionIds || inspectionIds.length === 0) {
        toast.info("Nenhuma inspeção selecionada para exclusão.");
        return { successCount: 0, failureCount: 0 }; // Or appropriate response
      }
      const toastId = toast.loading(`Excluindo ${inspectionIds.length} inspeções...`);
      try {
        // Assuming deleteMultipleInspectionsService returns an object like { successCount: number, failureCount: number }
        // Adjust based on actual service implementation.
        const result = await deleteMultipleInspectionsService(inspectionIds); 
        toast.dismiss(toastId);

        if (result && typeof result.successCount === 'number') {
          // Assuming the service returns errorCount for failures
          if (result.errorCount && result.errorCount > 0) { 
            toast.warning(
              `${result.successCount} inspeções excluídas com sucesso, ${result.errorCount} falharam.`
            );
          } else {
            toast.success(`${result.successCount} inspeções excluídas com sucesso.`);
          }
        } else {
          // Fallback if service response is not as expected
          toast.success("Operação de exclusão em massa concluída.");
        }
        return result;
      } catch (error: any) {
        toast.dismiss(toastId);
        toast.error("Erro ao excluir inspeções em massa", {
          description: error?.message || "Ocorreu um erro inesperado.",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });

  return {
    deleteInspection,
    deleteMultipleInspections,
  };
}
