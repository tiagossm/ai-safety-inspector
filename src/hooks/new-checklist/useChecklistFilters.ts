
import { useState, useEffect, useMemo } from 'react';
import { ChecklistWithStats } from '@/types/newChecklist';

export interface CompanyListItem {
  id: string;
  name: string;
}

interface UseChecklistFiltersResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  categories: string[];
  filteredChecklists: ChecklistWithStats[];
}

export function useChecklistFilters(
  checklists: ChecklistWithStats[],
  allChecklists: ChecklistWithStats[] = []
): UseChecklistFiltersResult {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState('all');
  const [sortOrder, setSortOrder] = useState('created_desc');

  // Extract unique categories from all checklists
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    allChecklists.forEach(checklist => {
      if (checklist.category) {
        uniqueCategories.add(checklist.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [allChecklists]);

  // Apply filters to get filtered checklists
  const filteredChecklists = useMemo(() => {
    return checklists
      .filter(checklist => {
        // Filter by search term
        const matchesSearch = searchTerm === '' || 
          checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filter by type
        const matchesType = filterType === 'all' || 
          (filterType === 'template' && checklist.is_template) ||
          (filterType === 'active' && !checklist.is_template && checklist.status === 'active') ||
          (filterType === 'inactive' && !checklist.is_template && checklist.status === 'inactive');

        // Filter by company
        const matchesCompany = selectedCompanyId === 'all' || 
          checklist.company_id === selectedCompanyId;
          
        // Filter by category
        const matchesCategory = selectedCategory === 'all' || 
          checklist.category === selectedCategory;
          
        // Filter by origin
        const matchesOrigin = selectedOrigin === 'all' || 
          checklist.origin === selectedOrigin;

        return matchesSearch && matchesType && matchesCompany && matchesCategory && matchesOrigin;
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case 'title_asc':
            return a.title.localeCompare(b.title);
          case 'title_desc':
            return b.title.localeCompare(a.title);
          case 'created_asc':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'created_desc':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [
    checklists, 
    searchTerm, 
    filterType, 
    selectedCompanyId, 
    selectedCategory, 
    selectedOrigin,
    sortOrder
  ]);

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
