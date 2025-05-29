
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ActionPlanFilters } from "@/components/action-plans/ActionPlanFilters";
import { ActionPlanList } from "@/components/action-plans/ActionPlanList";
import { useActionPlanFilters } from "@/hooks/useActionPlanFilters";
import { ActionPlanWithRelations } from "@/types/action-plan";

export default function ActionPlans() {
  const [actionPlans, setActionPlans] = useState<ActionPlanWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    filteredActionPlans
  } = useActionPlanFilters(actionPlans);

  useEffect(() => {
    fetchActionPlans();
  }, []);

  const fetchActionPlans = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("inspection_action_plans")
        .select(`
          *,
          inspection:inspection_id (
            id,
            company:company_id (
              id,
              fantasy_name
            )
          ),
          question:question_id (pergunta)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Safely cast the data with proper type handling
      const safeData = (data || []).map(item => {
        // Ensure the question property has the correct shape
        const processedItem: ActionPlanWithRelations = {
          ...item,
          title: item.description, // Use description as title if title doesn't exist
          question: item.question === null ? null : 
            (typeof item.question === 'object' && item.question ? 
              { 
                pergunta: typeof item.question === 'object' && 
                          item.question !== null && 
                          'pergunta' in item.question && 
                          typeof (item.question as any).pergunta === 'string' ? 
                          (item.question as any).pergunta : undefined
              } : 
              { pergunta: undefined }),
          // Fix the inspection company type issue
          inspection: item.inspection ? {
            ...item.inspection,
            company: item.inspection.company ? {
              id: item.inspection.company.id || '',
              fantasy_name: item.inspection.company.fantasy_name
            } : undefined
          } : undefined
        };
        return processedItem;
      });
      
      setActionPlans(safeData);
    } catch (error) {
      console.error("Error fetching action plans:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Planos de Ação</h2>
        <p className="text-muted-foreground">
          Gerencie e acompanhe os planos de ação para corrigir não conformidades
        </p>
      </div>

      <ActionPlanFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      <ActionPlanList 
        loading={loading} 
        actionPlans={filteredActionPlans} 
      />
    </div>
  );
}
