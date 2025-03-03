
import { useFetchChecklists } from "./checklist/useFetchChecklists";
import { useCreateChecklist } from "./checklist/useCreateChecklist";
import { useUpdateChecklist } from "./checklist/useUpdateChecklist";
import { useDeleteChecklist } from "./checklist/useDeleteChecklist";
import { useFilterChecklists } from "./checklist/useFilterChecklists";

// Re-export types from the types file
export type { Checklist, ChecklistItem, CollaboratorType, NewChecklist } from "@/types/checklist";

export function useChecklists() {
  const { 
    data: checklists = [], 
    isLoading,
    error,
    refetch 
  } = useFetchChecklists();
  
  const createChecklist = useCreateChecklist();
  const updateChecklist = useUpdateChecklist();
  const deleteChecklist = useDeleteChecklist();
  
  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredChecklists
  } = useFilterChecklists(checklists);

  return {
    checklists: filteredChecklists,
    isLoading,
    error,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    refetch,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType
  };
}
