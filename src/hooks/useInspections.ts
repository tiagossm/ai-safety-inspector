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
    search: "",
    status: "all",
    priority: "all",
    companyId: "all",
    responsibleId: "all", 
    checklistId: "all",
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

      // Fetch inspections with company, responsible and progress data
      let query = supabase
        .from("inspections")
        .select(`
          *,
          company:companies(id, fantasy_name),
          responsible:responsible_id(id, name, email, phone),
          responses:inspection_responses(id, question_id, answer)
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
      
      // Calculate progress for each inspection
      const inspectionsWithProgress = data.map((inspection: any) => {
        const totalQuestions = inspection.checklist?.total_questions || 0;
        const answeredQuestions = inspection.responses?.length || 0;
        const progress = totalQuestions > 0 
          ? Math.round((answeredQuestions / totalQuestions) * 100) 
          : 0;
          
        return {
          ...inspection,
          progress,
          company: inspection.company || null,
          responsible: inspection.responsible || null,
          // Remove the responses array to keep the object clean
          responses: undefined
        };
      });
      
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
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        (inspection.title?.toLowerCase().includes(searchLower)) ||
        (inspection.company?.fantasy_name?.toLowerCase().includes(searchLower)) ||
        (inspection.responsible?.name?.toLowerCase().includes(searchLower));
      
      // Status filter
      const matchesStatus = filters.status === "all" || inspection.status === filters.status;
      
      // Priority filter
      const matchesPriority = filters.priority === "all" || inspection.priority === filters.priority;
      
      // Company filter
      const matchesCompany = filters.companyId === "all" || inspection.company_id === filters.companyId;
      
      // Responsible filter
      const matchesResponsible = filters.responsibleId === "all" || inspection.responsible_id === filters.responsibleId;
      
      // Checklist filter
      const matchesChecklist = filters.checklistId === "all" || inspection.checklist_id === filters.checklistId;
      
      // Date filter
      let matchesDate = true;
      if (filters.startDate) {
        const scheduledDate = inspection.scheduledDate ? new Date(inspection.scheduledDate) : null;
        const startDate = filters.startDate;
        const endDate = filters.endDate || startDate;
        
        if (scheduledDate) {
          // Remove time component for date comparison
          const dateOnly = new Date(scheduledDate.setHours(0, 0, 0, 0));
          const startDateOnly = new Date(startDate.setHours(0, 0, 0, 0));
          const endDateOnly = new Date(endDate.setHours(23, 59, 59, 999));
          
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
