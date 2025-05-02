
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { 
  fetchCompanies, 
  fetchCompanyById, 
  validateCompanyId, 
  createCompany,
  CompanySearchResult
} from "@/services/company/companySelectionService";

export function useCompanySelectionStore(initialSelectedId?: string) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(initialSelectedId);
  const queryClient = useQueryClient();

  // Fetch all companies
  const {
    data: companies = [],
    isLoading: loadingCompanies,
    error: companiesError,
    refetch: refetchCompanies
  } = useQuery({
    queryKey: ["companies"],
    queryFn: () => fetchCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search companies with term
  const searchCompanies = useCallback(async (term: string) => {
    return fetchCompanies(term);
  }, []);

  // Fetch selected company details
  const {
    data: selectedCompany,
    isLoading: loadingSelectedCompany,
    error: selectedCompanyError
  } = useQuery({
    queryKey: ["company", selectedCompanyId],
    queryFn: () => selectedCompanyId ? fetchCompanyById(selectedCompanyId) : null,
    enabled: !!selectedCompanyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create company mutation
  const { 
    mutateAsync: createCompanyMutation,
    isLoading: isCreatingCompany
  } = useMutation({
    mutationFn: createCompany,
    onSuccess: (newCompany) => {
      // Invalidate companies query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      
      if (newCompany) {
        setSelectedCompanyId(newCompany.id);
      }
    }
  });

  // Validate company ID
  const validateCompany = useCallback(async (id: string) => {
    return await validateCompanyId(id);
  }, []);

  // Set selected company with validation
  const selectCompany = useCallback(async (id: string | undefined) => {
    if (!id) {
      setSelectedCompanyId(undefined);
      return { valid: false, error: "ID não fornecido" };
    }
    
    const validation = await validateCompanyId(id);
    if (validation.valid) {
      setSelectedCompanyId(id);
    }
    
    return validation;
  }, []);

  return {
    // Data
    companies,
    selectedCompany,
    selectedCompanyId,
    
    // Loading states
    loadingCompanies,
    loadingSelectedCompany,
    isCreatingCompany,
    
    // Errors
    companiesError,
    selectedCompanyError,
    
    // Actions
    selectCompany,
    setSelectedCompanyId,
    searchCompanies,
    createCompany: createCompanyMutation,
    validateCompany,
    refetchCompanies
  };
}
