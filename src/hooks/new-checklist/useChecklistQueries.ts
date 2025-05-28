import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchChecklists, fetchAllChecklistsData } from "@/services/checklist/checklistQueryService";
import { ChecklistWithStats } from "@/types/checklist";
import { handleApiError } from "@/utils/errorHandling";
import { toast } from "sonner";

/**
 * Hook para buscar dados de checklists com filtros
 * Implementa cache e invalidação adequados
 */
export function useChecklistQueries(
  filterType: string = "all",
  companyId: string = "all",
  category: string = "all",
  origin: string = "all",
  sortOrder: string = "created_at_desc"
) {
  const queryClient = useQueryClient();
  
  // Chave de consulta com todos os parâmetros relevantes
  const queryKey = ["new-checklists", filterType, companyId, category, origin, sortOrder];
  
  // Busca checklists filtrados
  const { 
    data: checklists = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => fetchChecklists(filterType, companyId, category, origin, sortOrder),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    onError: (error) => handleApiError(error, "Erro ao buscar checklists")
  });
  
  // Busca todos os dados de checklists para filtragem do lado do cliente
  const { 
    data: allChecklists = [],
    isLoading: isLoadingAll,
    error: allError
  } = useQuery({
    queryKey: ["all-new-checklists"],
    queryFn: fetchAllChecklistsData,
    staleTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    onError: (error) => handleApiError(error, "Erro ao buscar todos os checklists")
  });
  
  // Função para forçar atualização dos dados
  const forceRefresh = async () => {
    const toastId = toast.loading("Atualizando dados...");
    try {
      // Invalida as consultas para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      await queryClient.invalidateQueries({ queryKey: ["all-new-checklists"] });
      
      // Refaz a consulta atual
      await refetch();
      
      toast.dismiss(toastId);
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      toast.dismiss(toastId);
      handleApiError(error, "Erro ao atualizar dados");
    }
  };
  
  return {
    checklists: checklists as ChecklistWithStats[],
    allChecklists: allChecklists as ChecklistWithStats[],
    isLoading: isLoading || isLoadingAll,
    error: error || allError,
    refetch,
    forceRefresh
  };
}
