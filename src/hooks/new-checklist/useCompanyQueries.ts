
import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/services/company/companyService";
import { handleApiError } from "@/utils/errors";

/**
 * Hook para buscar dados de empresas
 */
export function useCompanyQueries() {
  // Buscar empresas para o filtro
  const { 
    data: companies = [], 
    isLoading: isLoadingCompanies,
    error
  } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      try {
        return await fetchCompanies();
      } catch (error) {
        // Usando corretamente o handleApiError com o segundo parâmetro opcional
        console.error(handleApiError(error, "Erro ao carregar empresas"));
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  return { 
    companies, 
    isLoadingCompanies,
    hasError: !!error 
  };
}
