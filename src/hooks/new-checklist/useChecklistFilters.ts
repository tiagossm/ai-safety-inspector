
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

  // Extract all unique categories from checklists
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    
    allChecklists.forEach(checklist => {
      if (checklist.category) {
        uniqueCategories.add(checklist.category);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, [allChecklists]);

  // Apply filters to checklists
  const filteredChecklists = useMemo(() => {
    let result = [...checklists];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(checklist => 
        checklist.title.toLowerCase().includes(searchLower) || 
        (checklist.description && checklist.description.toLowerCase().includes(searchLower)) ||
        (checklist.companyName && checklist.companyName.toLowerCase().includes(searchLower)) ||
        (checklist.category && checklist.category.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply filter type
    if (filterType === 'active') {
      result = result.filter(checklist => !checklist.is_template && checklist.status === 'active');
    } else if (filterType === 'template') {
      result = result.filter(checklist => checklist.is_template);
    } else if (filterType === 'inactive') {
      result = result.filter(checklist => !checklist.is_template && checklist.status === 'inactive');
    }
    
    // Apply company filter
    if (selectedCompanyId !== 'all') {
      result = result.filter(checklist => checklist.company_id === selectedCompanyId);
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(checklist => checklist.category === selectedCategory);
    }
    
    // Apply origin filter
    if (selectedOrigin !== 'all') {
      result = result.filter(checklist => checklist.origin === selectedOrigin);
    }
    
    // Apply sorting
    result.sort((a, b) => {
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
    
    return result;
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
