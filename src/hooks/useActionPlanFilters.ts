
import { useState, useMemo } from 'react';
import { ActionPlanWithRelations } from '@/types/action-plan';

export function useActionPlanFilters(actionPlans: ActionPlanWithRelations[]) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredActionPlans = useMemo(() => {
    return actionPlans.filter(plan => {
      // Apply search filter
      const searchMatch = search === "" || 
        plan.description.toLowerCase().includes(search.toLowerCase()) ||
        (plan.title?.toLowerCase().includes(search.toLowerCase()) || false) ||
        (plan.inspection?.company?.fantasy_name.toLowerCase().includes(search.toLowerCase()) || false) ||
        (plan.question !== null && 
         typeof plan.question === 'object' && 
         plan.question && 
         'pergunta' in plan.question && 
         typeof plan.question.pergunta === 'string' && 
         plan.question.pergunta.toLowerCase().includes(search.toLowerCase()));
      
      // Apply status filter
      const statusMatch = statusFilter === "all" || plan.status === statusFilter;
      
      // Apply priority filter
      const priorityMatch = priorityFilter === "all" || plan.priority === priorityFilter;
      
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [actionPlans, search, statusFilter, priorityFilter]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    filteredActionPlans
  };
}
