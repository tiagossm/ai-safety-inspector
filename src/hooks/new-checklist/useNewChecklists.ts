import { useState } from 'react';
import { useChecklistQueries } from './useChecklistQueries';
import { useCompanyQueries } from './useCompanyQueries';
import { useChecklistMutations } from './useChecklistMutations';
import { useChecklistFilters } from './useChecklistFilters';

/**
 * Hook principal que compõe toda a funcionalidade de checklists
 * Centraliza o acesso a consultas, mutações e filtros
 */
export function useNewChecklists() {
  // Estado dos filtros
  const [filterType, setFilterType] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [sortOrder, setSortOrder] = useState("created_at_desc");
  
  // Obtém dados de checklists
  const { 
    checklists, 
    allChecklists, 
    isLoading,
    forceRefresh 
  } = useChecklistQueries(filterType, selectedCompanyId, selectedCategory, selectedOrigin, sortOrder);
  
  // Obtém dados de empresas
  const { companies, isLoadingCompanies } = useCompanyQueries();
  
  // Obtém mutações
  const { 
    deleteChecklist, 
    updateStatus, 
    updateBulkStatus, 
    deleteBulkChecklists, 
    refetch 
  } = useChecklistMutations();
  
  // Aplica filtros
  const {
    searchTerm,
    setSearchTerm,
    categories,
    filteredChecklists
  } = useChecklistFilters(checklists, allChecklists);

  // Retorna todos os estados e funções necessários
  return {
    checklists: filteredChecklists,
    allChecklists,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCategory,
    setSelectedCategory,
    selectedOrigin,
    setSelectedOrigin,
    sortOrder,
    setSortOrder,
    companies,
    categories,
    isLoadingCompanies,
    deleteChecklist,
    updateStatus,
    updateBulkStatus,
    deleteBulkChecklists,
    refetch,
    forceRefresh
  };
}
