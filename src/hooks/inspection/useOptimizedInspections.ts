import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InspectionDetails, InspectionFilters } from "@/types/newChecklist";

// Helper function to build the query based on filters
const buildQuery = (filters: InspectionFilters) => {
  let query = supabase
    .from('inspections')
    .select(`
      *,
      companies:company_id (id, fantasy_name),
      checklist:checklist_id (id, title, description)
    `);

  if (filters.search) {
    query = query.ilike('id', `%${filters.search}%`);
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }

  if (filters.companyId && filters.companyId !== 'all') {
    query = query.eq('company_id', filters.companyId);
  }

  if (filters.responsibleId && filters.responsibleId !== 'all') {
    query = query.eq('responsible_id', filters.responsibleId);
  }

  if (filters.checklistId && filters.checklistId !== 'all') {
    query = query.eq('checklist_id', filters.checklistId);
  }

  if (filters.startDate && filters.endDate) {
    query = query.gte('created_at', filters.startDate.toISOString())
                 .lte('created_at', filters.endDate.toISOString());
  }

  return query.order('created_at', { ascending: false });
};

// Function to fetch inspection response stats
async function fetchInspectionStats(inspectionId: string) {
  try {
    const { data, error, count } = await supabase
      .from('inspection_responses')
      .select('*', { count: 'exact' })
      .eq('inspection_id', inspectionId);
    
    if (error) throw error;
    
    // Count completed items
    const completedItems = data ? data.filter(response => 
      response.completed_at !== null
    ).length : 0;
    
    return {
      totalItems: count || 0,
      completedItems: completedItems
    };
  } catch (err) {
    console.error(`Error fetching stats for inspection ${inspectionId}:`, err);
    return { totalItems: 0, completedItems: 0 };
  }
}

export function useOptimizedInspections(filters: InspectionFilters) {
  const [inspections, setInspections] = useState<InspectionDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setLoading(true);
        
        const query = buildQuery(filters);
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Process and map the inspections
        const inspectionsWithStats = await Promise.all((data || []).map(async (item: any) => {
          // Get stats for each inspection
          const stats = await fetchInspectionStats(item.id);
          
          // Extract title and description from checklist object or use fallbacks
          const title = item.checklist && typeof item.checklist === 'object' && item.checklist.title
            ? item.checklist.title
            : `Inspeção ${item.id.substring(0, 8)}`;
            
          const description = item.checklist && typeof item.checklist === 'object' && item.checklist.description
            ? item.checklist.description
            : '';
          
          // Normalize status to match the expected enum values
          const statusMapping: Record<string, "pending" | "in_progress" | "completed"> = {
            'pending': 'pending',
            'Pendente': 'pending',
            'in_progress': 'in_progress',
            'Em andamento': 'in_progress',
            'completed': 'completed',
            'Concluído': 'completed',
            'Concluido': 'completed'
          };
          
          const normalizedStatus: "pending" | "in_progress" | "completed" = 
            statusMapping[item.status] || 'pending';
          
          // Safe responsible handling
          const responsibleName = 'Sem responsável'; // Default value
          
          return {
            id: item.id,
            title: title,
            description: description,
            checklistId: item.checklist_id,
            companyId: item.company_id,
            responsibleId: item.responsible_id,
            scheduledDate: item.scheduled_date,
            status: normalizedStatus,
            createdAt: item.created_at,
            updatedAt: item.updated_at || item.created_at,
            priority: item.priority || 'medium' as 'low' | 'medium' | 'high',
            locationName: item.location,
            company: {
              id: item.company_id,
              name: item.companies?.fantasy_name || 'Sem empresa',
              fantasy_name: item.companies?.fantasy_name
            },
            responsible: {
              id: item.responsible_id,
              name: responsibleName,
              email: ''
            },
            progress: stats.totalItems > 0 ? Math.round((stats.completedItems / stats.totalItems) * 100) : 0,
            totalItems: stats.totalItems,
            completedItems: stats.completedItems,
            approval_notes: item.approval_notes,
            approval_status: item.approval_status,
            approved_by: item.approved_by,
            audio_url: item.audio_url,
            photos: item.photos || [],
            report_url: item.report_url,
            unit_id: item.unit_id,
            metadata: item.metadata,
            cnae: item.cnae,
            inspection_type: item.inspection_type,
            sync_status: item.sync_status,
            companyName: item.companies?.fantasy_name || 'Sem empresa',
            responsibleName: responsibleName
          } as InspectionDetails;
        }));
        
        setInspections(inspectionsWithStats);
        setError(null);
      } catch (err) {
        console.error("Error fetching inspections:", err);
        setError(err as Error);
        setInspections([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInspections();
    
    // Set up a polling interval to refresh data
    const interval = setInterval(() => {
      fetchInspections();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filters]);
  
  return {
    inspections,
    loading,
    error
  };
}

export default useOptimizedInspections;
