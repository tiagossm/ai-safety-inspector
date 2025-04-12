
import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/services/company/companyService";
import { handleApiError } from "@/utils/errors";

/**
 * Hook for fetching company data
 */
export function useCompanyQueries() {
  // Fetch companies for filter
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
        handleApiError(error, "Erro ao carregar empresas");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  return { 
    companies, 
    isLoadingCompanies,
    hasError: !!error 
  };
}
