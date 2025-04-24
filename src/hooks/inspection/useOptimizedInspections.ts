
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InspectionDetails, InspectionFilters } from "@/types/newChecklist";
import { useAuth } from "@/components/AuthProvider";

export function useOptimizedInspections() {
  const [inspections, setInspections] = useState<InspectionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<InspectionFilters>({
    status: "all",
    companyId: "all",
    responsibleId: "all", 
    checklistId: "all",
    search: "",
    priority: "all",
    startDate: undefined,
    endDate: undefined
  });

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Fetch inspections without trying to join on responsible_id directly
      let query = supabase
        .from("inspections")
        .select(`
          id,
          status,
          checklist_id,
          company_id,
          responsible_id,
          scheduled_date,
          created_at,
          updated_at,
          location,
          priority,
          metadata,
          inspection_type,
          companies:company_id(id, fantasy_name),
          checklist:checklist_id(id, title, description, total_questions)
        `);
      
      // Super admins see all inspections, others only see their own or company's
      if (user.tier !== "super_admin") {
        query = query.or(`user_id.eq.${user.id},responsible_id.eq.${user.id}`);
      }
      
      const { data: inspectionsData, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (!inspectionsData || inspectionsData.length === 0) {
        setInspections([]);
        return;
      }
      
      // Get unique user IDs from responsible_id to fetch in a single query
      const userIds = inspectionsData
        .map(inspection => inspection.responsible_id)
        .filter((id, index, self) => id !== null && id !== undefined && self.indexOf(id) === index);
      
      // Get unique checklist IDs to fetch all question counts at once
      const checklistIds = inspectionsData
        .map(inspection => inspection.checklist_id)
        .filter((id, index, self) => id !== null && id !== undefined && self.indexOf(id) === index);
      
      // Get unique inspection IDs for response counts
      const inspectionIds = inspectionsData
        .map(inspection => inspection.id)
        .filter((id, index, self) => id !== null && id !== undefined && self.indexOf(id) === index);
      
      // Fetch all required data in parallel
      const [usersData, questionsCountData, responsesCountData] = await Promise.all([
        // Fetch user data for all responsible users in one query
        userIds.length > 0 
          ? supabase
              .from("users")
              .select("id, name, email, phone")
              .in("id", userIds)
          : Promise.resolve({ data: [], error: null }),
        
        // Fetch total questions counts for all checklists at once
        // Use count aggregate and filter by checklist_id instead of group
        checklistIds.length > 0 
          ? Promise.all(
              checklistIds.map(checklistId => 
                supabase
                  .from('checklist_itens')
                  .select('*', { count: 'exact', head: true })
                  .eq('checklist_id', checklistId)
              )
            )
          : Promise.resolve([]),
          
        // Fetch answered questions counts for all inspections at once
        // Use count aggregate and filter by inspection_id instead of group
        inspectionIds.length > 0
          ? Promise.all(
              inspectionIds.map(inspectionId => 
                supabase
                  .from('inspection_responses')
                  .select('*', { count: 'exact', head: true })
                  .eq('inspection_id', inspectionId)
              )
            )
          : Promise.resolve([])
      ]);
      
      // Process the data into maps for quick lookup
      const usersMap = (usersData.data || []).reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      
      // Convert the array of count queries into a map for checklist questions
      const questionsCountMap = checklistIds.reduce((acc, checklistId, index) => {
        if (questionsCountData[index] && questionsCountData[index].count !== null) {
          acc[checklistId] = questionsCountData[index].count;
        } else {
          acc[checklistId] = 0;
        }
        return acc;
      }, {});
      
      // Convert the array of count queries into a map for inspection responses
      const responsesCountMap = inspectionIds.reduce((acc, inspectionId, index) => {
        if (responsesCountData[index] && responsesCountData[index].count !== null) {
          acc[inspectionId] = responsesCountData[index].count;
        } else {
          acc[inspectionId] = 0;
        }
        return acc;
      }, {});
      
      // Now build the final inspections array with all the data
      const processedInspections: InspectionDetails[] = inspectionsData.map(inspection => {
        const totalQuestions = questionsCountMap[inspection.checklist_id] || 0;
        const answeredQuestions = responsesCountMap[inspection.id] || 0;
        const progress = totalQuestions > 0 
          ? Math.round((answeredQuestions / totalQuestions) * 100) 
          : 0;
          
        // Convert metadata from JSON to Record<string, any> or provide an empty object
        const metadata = typeof inspection.metadata === 'object' 
          ? inspection.metadata as Record<string, any> 
          : {};
          
        return {
          id: inspection.id,
          title: inspection.checklist?.title || "Sem título",
          description: inspection.checklist?.description,
          checklistId: inspection.checklist_id,
          companyId: inspection.company_id,
          responsibleId: inspection.responsible_id,
          scheduledDate: inspection.scheduled_date,
          status: (inspection.status || 'pending') as 'pending' | 'in_progress' | 'completed',
          createdAt: inspection.created_at,
          updatedAt: inspection.created_at,
          priority: (inspection.priority || 'medium') as 'low' | 'medium' | 'high',
          locationName: inspection.location,
          company: {
            id: inspection.company_id,
            fantasy_name: inspection.companies?.fantasy_name
          },
          responsible: inspection.responsible_id ? {
            id: inspection.responsible_id,
            name: usersMap[inspection.responsible_id]?.name
          } : undefined,
          progress,
          metadata
        };
      });
      
      setInspections(processedInspections);
    } catch (error: any) {
      console.error("Error fetching inspections:", error);
      setError(error.message);
      toast.error("Erro ao carregar inspeções", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [user]);

  // Apply filters with memoization to avoid unnecessary recalculations
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      // Search filter (case insensitive)
      const searchLower = (filters.search || "").toLowerCase();
      const matchesSearch = !filters.search || 
        (inspection.title?.toLowerCase().includes(searchLower)) ||
        (inspection.company?.fantasy_name?.toLowerCase().includes(searchLower)) ||
        (inspection.responsible?.name?.toLowerCase().includes(searchLower));
      
      // Other filters
      const matchesStatus = filters.status === "all" || inspection.status === filters.status;
      const matchesPriority = !filters.priority || filters.priority === "all" || inspection.priority === filters.priority;
      const matchesCompany = filters.companyId === "all" || inspection.companyId === filters.companyId;
      const matchesResponsible = filters.responsibleId === "all" || inspection.responsibleId === filters.responsibleId;
      const matchesChecklist = filters.checklistId === "all" || inspection.checklistId === filters.checklistId;
      
      // Date filter
      let matchesDate = true;
      if (filters.startDate) {
        const scheduledDate = inspection.scheduledDate ? new Date(inspection.scheduledDate) : null;
        const startDate = filters.startDate;
        const endDate = filters.endDate || startDate;
        
        if (scheduledDate) {
          // Convert to date objects for comparison
          const dateOnly = new Date(scheduledDate);
          dateOnly.setHours(0, 0, 0, 0);
          
          const startDateOnly = new Date(startDate);
          startDateOnly.setHours(0, 0, 0, 0);
          
          const endDateOnly = new Date(endDate);
          endDateOnly.setHours(23, 59, 59, 999);
          
          matchesDate = dateOnly >= startDateOnly && dateOnly <= endDateOnly;
        } else {
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && 
        matchesCompany && matchesResponsible && matchesChecklist && matchesDate;
    });
  }, [inspections, filters]);

  return {
    inspections: filteredInspections,
    loading,
    error,
    fetchInspections,
    filters,
    setFilters
  };
}
