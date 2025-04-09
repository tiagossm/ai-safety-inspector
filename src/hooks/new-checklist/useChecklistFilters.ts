
import { useState, useEffect, useMemo } from 'react';
import { ChecklistWithStats } from '@/types/newChecklist';

export function useChecklistFilters(
  checklists: ChecklistWithStats[],
  allChecklists: ChecklistWithStats[]
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState('all');
  const [sortOrder, setSortOrder] = useState('created_desc');

  // Extract unique categories from the checklists
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    allChecklists.forEach(checklist => {
      if (checklist.category) {
        uniqueCategories.add(checklist.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [allChecklists]);

  // Apply filters to the checklists
  const filteredChecklists = useMemo(() => {
    return checklists.filter(checklist => {
      // Apply search filter
      if (searchTerm && !checklist.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Apply type filter
      if (filterType === 'template' && !checklist.is_template) {
        return false;
      }

      if (filterType === 'active' && checklist.status !== 'active') {
        return false;
      }

      // Apply company filter
      if (selectedCompanyId !== 'all' && checklist.company_id !== selectedCompanyId) {
        return false;
      }

      // Apply category filter
      if (selectedCategory !== 'all' && checklist.category !== selectedCategory) {
        return false;
      }

      // Apply origin filter
      if (selectedOrigin !== 'all' && checklist.origin !== selectedOrigin) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Apply sorting
      switch (sortOrder) {
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'created_asc':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'created_desc':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
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
