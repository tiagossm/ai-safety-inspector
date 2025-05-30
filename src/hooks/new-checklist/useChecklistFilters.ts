
import { useState, useMemo, useCallback } from 'react';
import { ChecklistWithStats } from "@/types/newChecklist";

/**
 * Hook for managing checklist filters and search
 */
export function useChecklistFilters(checklists: ChecklistWithStats[], allChecklists: ChecklistWithStats[]) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [sortOrder, setSortOrder] = useState("created_at_desc");

  // Extract unique categories from checklists
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    
    allChecklists.forEach(checklist => {
      if (checklist.category) {
        uniqueCategories.add(checklist.category);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, [allChecklists]);

  // Normalize search term for efficient search
  const normalizedSearchTerm = useMemo(() => 
    searchTerm.trim().toLowerCase(),
    [searchTerm]
  );

  // Memoized callback for filtering individual checklist
  const checklistMatchesSearch = useCallback((checklist: ChecklistWithStats, term: string) => {
    if (!term) return true;
    
    return (
      (checklist.title?.toLowerCase().includes(term)) ||
      (checklist.description?.toLowerCase().includes(term)) ||
      (checklist.category?.toLowerCase().includes(term)) ||
      (checklist.companyName?.toLowerCase().includes(term))
    );
  }, []);

  // Apply search filter on top of API filters
  const filteredChecklists = useMemo(() => {
    if (!normalizedSearchTerm) {
      return checklists;
    }
    
    return checklists.filter(checklist => 
      checklistMatchesSearch(checklist, normalizedSearchTerm)
    );
  }, [checklists, normalizedSearchTerm, checklistMatchesSearch]);

  return {
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
    categories,
    filteredChecklists
  };
}
