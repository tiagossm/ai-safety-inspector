
import { useChecklistQueries } from './useChecklistQueries';
import { useCompanyQueries } from './useCompanyQueries';
import { useChecklistMutations } from './useChecklistMutations';
import { useChecklistFilters } from './useChecklistFilters';

export function useNewChecklists() {
  // Get filter state
  const [filterType, setFilterType] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [sortOrder, setSortOrder] = useState("created_desc");
  
  // Get checklist data
  const { 
    checklists, 
    allChecklists, 
    isLoading 
  } = useChecklistQueries(filterType, selectedCompanyId, selectedCategory, selectedOrigin, sortOrder);
  
  // Get company data
  const { companies, isLoadingCompanies } = useCompanyQueries();
  
  // Get mutations
  const { deleteChecklist, refetch } = useChecklistMutations();
  
  // Apply filters
  const {
    searchTerm,
    setSearchTerm,
    filterType: derivedFilterType,
    setFilterType: setDerivedFilterType,
    selectedCompanyId: derivedSelectedCompanyId,
    setSelectedCompanyId: setDerivedSelectedCompanyId,
    selectedCategory: derivedSelectedCategory,
    setSelectedCategory: setDerivedSelectedCategory,
    selectedOrigin: derivedSelectedOrigin,
    setSelectedOrigin: setDerivedSelectedOrigin,
    sortOrder: derivedSortOrder,
    setSortOrder: setDerivedSortOrder,
    categories,
    filteredChecklists
  } = useChecklistFilters(checklists, allChecklists);

  // Ensure our state stays in sync
  useEffect(() => {
    setDerivedFilterType(filterType);
  }, [filterType]);

  useEffect(() => {
    setDerivedSelectedCompanyId(selectedCompanyId);
  }, [selectedCompanyId]);

  useEffect(() => {
    setDerivedSelectedCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setDerivedSelectedOrigin(selectedOrigin);
  }, [selectedOrigin]);

  useEffect(() => {
    setDerivedSortOrder(sortOrder);
  }, [sortOrder]);

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
    refetch,
    deleteChecklist
  };
}

// Add missing imports
import { useState, useEffect } from 'react';
