
import { useState, useMemo } from 'react';
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
  const [sortOrder, setSortOrder] = useState("created_desc");

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

  // Apply search filter on top of API filters
  const filteredChecklists = useMemo(() => {
    if (!searchTerm.trim()) {
      return checklists;
    }
    
    const normalized = searchTerm.trim().toLowerCase();
    
    return checklists.filter(checklist => 
      checklist.title.toLowerCase().includes(normalized) ||
      checklist.description?.toLowerCase().includes(normalized) ||
      checklist.category?.toLowerCase().includes(normalized) ||
      checklist.companyName?.toLowerCase().includes(normalized)
    );
  }, [checklists, searchTerm]);

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
