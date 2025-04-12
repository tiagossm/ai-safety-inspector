
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InspectionDetails, InspectionFilters } from "@/types/newChecklist";
import { useAuth } from "@/components/AuthProvider";

export function useInspections() {
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
          *,
          companies:company_id(id, fantasy_name),
          checklist:checklist_id(id, title, description, total_questions)
        `);
      
      // Super admins see all inspections, others only see their own or company's
      if (user.tier !== "super_admin") {
        query = query.or(`user_id.eq.${user.id},responsible_id.eq.${user.id}`);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (!data) {
        setInspections([]);
        return;
      }
      
      // Now that we have inspections, fetch user data for responsible_id in a separate query
      const userIds = data
        .map(inspection => inspection.responsible_id)
        .filter(id => id !== null && id !== undefined);
      
      let responsiblesData = {};
      
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email, phone")
          .in("id", userIds);
          
        if (!usersError && usersData) {
          responsiblesData = usersData.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
        }
      }
      
      // Calculate progress for each inspection with optimized queries
      const inspectionsWithProgress = await Promise.all(data.map(async (inspection: any) => {
        // Optimized query to get count of responses for this inspection
        const { count: answeredQuestions, error: countError } = await supabase
          .from('inspection_responses')
          .select('*', { count: 'exact', head: true })
          .eq('inspection_id', inspection.id);
        
        if (countError) {
          console.error("Error fetching response count:", countError);
        }
        
        // Optimized query to get total questions count
        const { count: totalQuestions, error: questionError } = await supabase
          .from('checklist_itens')
          .select('*', { count: 'exact', head: true })
          .eq('checklist_id', inspection.checklist_id);
          
        if (questionError) {
          console.error("Error fetching question count:", questionError);
        }
        
        const progress = totalQuestions > 0 
          ? Math.round(((answeredQuestions || 0) / totalQuestions) * 100) 
          : 0;
          
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
            name: responsiblesData[inspection.responsible_id]?.name
          } : undefined,
          progress,
          metadata: inspection.metadata,
          syncStatus: inspection.sync_status
        };
      }));
      
      setInspections(inspectionsWithProgress);
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

  // Apply filters
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      // Search filter
      const searchLower = (filters.search || "").toLowerCase();
      const matchesSearch = !filters.search || 
        (inspection.title?.toLowerCase().includes(searchLower)) ||
        (inspection.company?.fantasy_name?.toLowerCase().includes(searchLower)) ||
        (inspection.responsible?.name?.toLowerCase().includes(searchLower));
      
      // Status filter
      const matchesStatus = filters.status === "all" || inspection.status === filters.status;
      
      // Priority filter
      const matchesPriority = !filters.priority || filters.priority === "all" || inspection.priority === filters.priority;
      
      // Company filter
      const matchesCompany = filters.companyId === "all" || inspection.companyId === filters.companyId;
      
      // Responsible filter
      const matchesResponsible = filters.responsibleId === "all" || inspection.responsibleId === filters.responsibleId;
      
      // Checklist filter
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
