
import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/services/checklist/checklistService";

export function useCompanyQueries() {
  // Fetch companies for filter
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      return fetchCompanies();
    }
  });

  return { companies, isLoadingCompanies };
}
