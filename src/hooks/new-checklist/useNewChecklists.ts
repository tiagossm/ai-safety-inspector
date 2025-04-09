
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChecklistWithStats } from '@/types/newChecklist';
import { useCompanyQueries } from './useCompanyQueries';
import { useChecklistMutations } from './useChecklistMutations';
import { useChecklistFilters } from './useChecklistFilters';

/**
 * Main hook that composes all checklist functionality
 */
export function useNewChecklists() {
  // Filter state
  const [filterType, setFilterType] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [sortOrder, setSortOrder] = useState("created_desc");
  
  // Fetch all checklists
  const fetchChecklists = async () => {
    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        companies:company_id (id, fantasy_name),
        users:user_id (id, name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      is_template: item.is_template || false,
      isTemplate: item.is_template || false,
      status: item.status === 'active' ? 'active' : 'inactive' as "active" | "inactive",
      category: item.category || '',
      responsible_id: item.responsible_id,
      responsibleId: item.responsible_id,
      company_id: item.company_id,
      companyId: item.company_id,
      user_id: item.user_id,
      userId: item.user_id,
      created_at: item.created_at,
      createdAt: item.created_at,
      updated_at: item.updated_at,
      updatedAt: item.updated_at,
      due_date: item.due_date,
      dueDate: item.due_date,
      is_sub_checklist: item.is_sub_checklist || false,
      isSubChecklist: item.is_sub_checklist || false,
      origin: item.origin || 'manual',
      parent_question_id: item.parent_question_id,
      parentQuestionId: item.parent_question_id,
      totalQuestions: 0,
      completedQuestions: 0,
      companyName: item.companies?.fantasy_name || '',
      responsibleName: item.users ? item.users.name || '' : ''
    })) as ChecklistWithStats[];
  };
  
  // Get checklist data
  const checklistsQuery = useQuery({
    queryKey: ['new-checklists'],
    queryFn: fetchChecklists
  });
  
  const checklists = checklistsQuery.data || [];
  const allChecklists = checklistsQuery.data || [];
  const isLoading = checklistsQuery.isLoading;
  
  // Get company data
  const { companies, isLoadingCompanies } = useCompanyQueries();
  
  // Get mutations
  const { deleteChecklist, updateStatus, updateBulkStatus, refetch } = useChecklistMutations();
  
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
    deleteChecklist,
    updateStatus,
    updateBulkStatus,
    refetch
  };
}
