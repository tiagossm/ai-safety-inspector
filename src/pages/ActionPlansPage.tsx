
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useActionPlans } from '@/hooks/inspection/useActionPlans';
import { useInspectionFetch } from '@/hooks/inspection/useInspectionFetch';
import { ActionPlanFormData } from '@/components/action-plans/form/types';
import { ActionPlanPageHeader } from '@/components/action-plans/ActionPlanPageHeader';
import { ActionPlanStats } from '@/components/action-plans/ActionPlanStats';
import { ActionPlanPageFilters } from '@/components/action-plans/ActionPlanPageFilters';
import { ActionPlanPageTable } from '@/components/action-plans/ActionPlanPageTable';

export default function ActionPlansPage() {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { inspection, loading: inspectionLoading } = useInspectionFetch(id);
  const {
    plans,
    loading: plansLoading,
    error,
    stats,
    saveActionPlan,
    refreshPlans
  } = useActionPlans(id);

  // Filter and sort action plans
  const filteredPlans = plans.filter(plan => {
    if (statusFilter !== 'all' && plan.status !== statusFilter) {
      return false;
    }
    
    if (priorityFilter !== 'all' && plan.priority !== priorityFilter) {
      return false;
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        plan.description.toLowerCase().includes(term) ||
        (plan.assignee?.toLowerCase().includes(term) || false)
      );
    }
    
    return true;
  });

  const loading = inspectionLoading || plansLoading;

  // Handle action plan save
  const handleSaveActionPlan = async (data: ActionPlanFormData): Promise<void> => {
    if (!id) return;
    await saveActionPlan(data);
  };

  return (
    <div className="container mx-auto py-8">
      <ActionPlanPageHeader 
        inspectionId={id}
        inspectionTitle={inspection?.title}
        companyName={inspection?.company?.fantasy_name}
      />

      <ActionPlanStats stats={stats} />

      <ActionPlanPageFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        refreshPlans={refreshPlans}
        loading={loading}
      />

      <ActionPlanPageTable
        loading={loading}
        error={error}
        filteredPlans={filteredPlans}
        inspectionId={id}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        refreshPlans={refreshPlans}
        handleSaveActionPlan={handleSaveActionPlan}
      />
    </div>
  );
}
