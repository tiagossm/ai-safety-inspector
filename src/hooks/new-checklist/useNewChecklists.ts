
import { useChecklistFetch } from "./useChecklistFetch";
import { useChecklistFilter } from "./useChecklistFilter";
import { useChecklistCreate } from "./useChecklistCreate";
import { useChecklistUpdate } from "./useChecklistUpdate";
import { useChecklistDelete } from "./useChecklistDelete";

export function useNewChecklists() {
  const { 
    data: checklists = [], 
    isLoading,
    error,
    refetch 
  } = useChecklistFetch();
  
  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    companies,
    isLoadingCompanies,
    filteredChecklists
  } = useChecklistFilter(checklists);
  
  const createChecklist = useChecklistCreate();
  const updateChecklist = useChecklistUpdate();
  const deleteChecklist = useChecklistDelete();

  return {
    // Data and loading states
    checklists: filteredChecklists,
    allChecklists: checklists,
    isLoading,
    error,
    refetch,
    
    // Filter controls
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    companies,
    isLoadingCompanies,
    
    // CRUD operations
    createChecklist,
    updateChecklist,
    deleteChecklist
  };
}
