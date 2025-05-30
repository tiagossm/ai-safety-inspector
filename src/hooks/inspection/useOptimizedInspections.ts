
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InspectionDetails, InspectionFilters } from "@/types/newChecklist";
import { useAuth } from "@/components/AuthProvider";

export function useOptimizedInspections() {
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

  const fetchInspectionsQueryFn = async (): Promise<InspectionDetails[]> => {
    if (!user) {
      // This should ideally not be reached if `enabled: !!user` is used correctly,
      // but as a safeguard:
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
    
    const { data: inspectionsData, error: inspectionsError } = await query.order("created_at", { ascending: false });
    
    if (inspectionsError) throw inspectionsError;
    
    if (!inspectionsData || inspectionsData.length === 0) {
      return [];
    }
    
    const userIds = inspectionsData
      .map(inspection => inspection.responsible_id)
      .filter((id, index, self) => id !== null && id !== undefined && self.indexOf(id) === index);
    
    const checklistIds = inspectionsData
      .map(inspection => inspection.checklist_id)
      .filter((id, index, self) => id !== null && id !== undefined && self.indexOf(id) === index);
    
    const inspectionIds = inspectionsData
      .map(inspection => inspection.id)
      .filter((id, index, self) => id !== null && id !== undefined && self.indexOf(id) === index);
    
    const [usersResponse, questionsCountResponses, responsesCountResponses] = await Promise.all([
      userIds.length > 0 
        ? supabase
            .from("users")
            .select("id, name, email, phone")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      
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

    if (usersResponse.error) throw usersResponse.error;
    // Error handling for checklist_itens and inspection_responses counts can be more granular if needed
    // For now, we assume they either succeed or the count will be 0.

    const usersMap = (usersResponse.data || []).reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {} as Record<string, {id: string; name: string | null; email: string | null; phone: string | null;}>);
    
    const questionsCountMap = checklistIds.reduce((acc, checklistId, index) => {
      const response = questionsCountResponses[index];
      // Check for error on individual count queries if supabase client returns it
      // For this example, we'll assume `response.error` would be checked if available on `response`
      acc[checklistId] = response?.count ?? 0;
      return acc;
    }, {} as Record<string, number>);
    
    const responsesCountMap = inspectionIds.reduce((acc, inspectionId, index) => {
      const response = responsesCountResponses[index];
      acc[inspectionId] = response?.count ?? 0;
      return acc;
    }, {} as Record<string, number>);
    
// Define a more specific type for the raw inspection data from Supabase
// This is an approximation based on the usage in the function
interface RawInspectionFromSupabase {
  id: string;
  status: string | null;
  checklist_id: string | null;
  company_id: string | null;
  responsible_id: string | null;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
  location: string | null;
  priority: string | null;
  metadata: Record<string, any> | null;
  inspection_type: string | null;
  companies: { id: string; fantasy_name: string | null } | null; // Joined company
  checklist: { id: string; title: string | null; description: string | null; total_questions: number | null } | null; // Joined checklist
  // Add other fields from the select if necessary
}

export function useOptimizedInspections() {
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

  const fetchInspectionsQueryFn = async (): Promise<InspectionDetails[]> => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

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
    
    if (user.tier !== "super_admin") {
      query = query.or(`user_id.eq.${user.id},responsible_id.eq.${user.id}`);
    }
    
    // Explicitly type the data from Supabase
    const { data: inspectionsData, error: inspectionsError } = await query.order("created_at", { ascending: false }) as { data: RawInspectionFromSupabase[] | null; error: any };
    
    if (inspectionsError) throw inspectionsError;
    
    if (!inspectionsData || inspectionsData.length === 0) {
      return [];
    }
    
    const userIds = inspectionsData
      .map(inspection => inspection.responsible_id)
      .filter((id): id is string => id !== null && id !== undefined) // Type guard
      .filter((id, index, self) => self.indexOf(id) === index);
    
    const checklistIds = inspectionsData
      .map(inspection => inspection.checklist_id)
      .filter((id): id is string => id !== null && id !== undefined) // Type guard
      .filter((id, index, self) => self.indexOf(id) === index);
    
    const inspectionIds = inspectionsData
      .map(inspection => inspection.id)
      // ID should not be null, but good practice if it could be
      .filter((id): id is string => id !== null && id !== undefined) // Type guard 
      .filter((id, index, self) => self.indexOf(id) === index);
    
    // Typing for Promise.all results
    const [usersResponse, questionsCountResponses, responsesCountResponses] = await Promise.all([
      userIds.length > 0 
        ? supabase
            .from("users")
            .select("id, name, email, phone")
            .in("id", userIds)
        : Promise.resolve({ data: [] as {id: string; name: string | null; email: string | null; phone: string | null;}[], error: null }), // Explicit type for empty case
      
      checklistIds.length > 0 
        ? Promise.all(
            checklistIds.map(checklistId => 
              supabase
                .from('checklist_itens')
                .select('*', { count: 'exact', head: true })
                .eq('checklist_id', checklistId)
            )
          )
        : Promise.resolve([] as { count: number | null; error: any }[]), // Explicit type for empty case
        
      inspectionIds.length > 0
        ? Promise.all(
            inspectionIds.map(inspectionId => 
              supabase
                .from('inspection_responses')
                .select('*', { count: 'exact', head: true })
                .eq('inspection_id', inspectionId)
            )
          )
        : Promise.resolve([] as { count: number | null; error: any }[]) // Explicit type for empty case
    ]);

    if (usersResponse.error) throw usersResponse.error;

    const usersMap = (usersResponse.data || []).reduce((acc, u) => {
      if(u.id) acc[u.id] = u; // Ensure u.id is not null
      return acc;
    }, {} as Record<string, {id: string; name: string | null; email: string | null; phone: string | null;}>);
    
    const questionsCountMap = checklistIds.reduce((acc, checklistId, index) => {
      const response = questionsCountResponses[index];
      acc[checklistId] = response?.count ?? 0;
      return acc;
    }, {} as Record<string, number>);
    
    const responsesCountMap = inspectionIds.reduce((acc, inspectionId, index) => {
      const response = responsesCountResponses[index];
      acc[inspectionId] = response?.count ?? 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Now map RawInspectionFromSupabase to InspectionDetails
    return inspectionsData.map((inspection: RawInspectionFromSupabase): InspectionDetails => {
      const totalQuestions = inspection.checklist_id ? questionsCountMap[inspection.checklist_id] || 0 : 0;
      const answeredQuestions = responsesCountMap[inspection.id] || 0;
      const progress = totalQuestions > 0 
        ? Math.round((answeredQuestions / totalQuestions) * 100) 
        : 0;
        
      const progress = totalQuestions > 0 
        ? Math.round((answeredQuestions / totalQuestions) * 100) 
        : 0;
        
      const metadata = inspection.metadata ?? {}; // Default to empty object if null
          
      return {
        id: inspection.id, // Not nullable in RawInspectionFromSupabase
        title: inspection.checklist?.title || "Sem título",
        description: inspection.checklist?.description || undefined, // Ensure undefined if null
        checklistId: inspection.checklist_id || undefined,
        companyId: inspection.company_id || undefined,
        responsibleId: inspection.responsible_id || undefined,
        scheduledDate: inspection.scheduled_date || undefined,
        status: (inspection.status || 'pending') as 'pending' | 'in_progress' | 'completed',
        createdAt: inspection.created_at, // Not nullable
        updatedAt: inspection.updated_at, // Not nullable
        priority: (inspection.priority || 'medium') as 'low' | 'medium' | 'high',
        locationName: inspection.location || undefined,
        company: inspection.companies ? { // Check if companies is not null
          id: inspection.companies.id, // id in companies should not be null
          fantasy_name: inspection.companies.fantasy_name || undefined
        } : undefined,
        responsible: inspection.responsible_id && usersMap[inspection.responsible_id] ? {
          id: inspection.responsible_id,
          name: usersMap[inspection.responsible_id]?.name || undefined
        } : undefined,
        progress,
        metadata
      };
    });
  };

  const { 
    data: rawInspections = [], 
    isLoading, 
    isError, 
    error: queryError, 
    refetch: refetchInspections 
  } = useQuery<InspectionDetails[], Error, InspectionDetails[], [string, string | undefined]>( // Explicit QueryKey type
    ['inspections', user?.id], 
    fetchInspectionsQueryFn,    
    {
      enabled: !!user, 
      staleTime: 1000 * 60 * 5, 
      cacheTime: 1000 * 60 * 30, 
      onError: (err: Error) => {
        toast.error("Erro ao carregar inspeções", {
          description: err.message
        });
      }
    }
  );

  const filteredInspections = useMemo(() => {
    return rawInspections.filter((inspection: InspectionDetails): boolean => { // Added type for inspection and return
      const searchLower = (filters.search || "").toLowerCase();
      const matchesSearch = !filters.search || 
        (inspection.title?.toLowerCase().includes(searchLower)) ||
        (inspection.company?.fantasy_name?.toLowerCase().includes(searchLower)) ||
        (inspection.responsible?.name?.toLowerCase().includes(searchLower));
      
      const matchesStatus = filters.status === "all" || inspection.status === filters.status;
      const matchesPriority = !filters.priority || filters.priority === "all" || (inspection.priority && inspection.priority === filters.priority);
      const matchesCompany = filters.companyId === "all" || inspection.companyId === filters.companyId;
      const matchesResponsible = filters.responsibleId === "all" || inspection.responsibleId === filters.responsibleId;
      const matchesChecklist = filters.checklistId === "all" || inspection.checklistId === filters.checklistId;
      
      let matchesDate = true;
      if (filters.startDate && inspection.scheduledDate) { // Ensure scheduledDate exists
        const scheduledDate = new Date(inspection.scheduledDate); // No longer null here
        const startDate = filters.startDate; // Already a Date
        const endDate = filters.endDate || startDate; // Already a Date
        
        // Create date objects for comparison without time
        const dateOnly = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        matchesDate = dateOnly >= startDateOnly && dateOnly <= endDateOnly;
      } else if (filters.startDate && !inspection.scheduledDate) { // If filter wants a date but inspection doesn't have one
        matchesDate = false;
      }
      
      return !!(matchesSearch && matchesStatus && matchesPriority && 
        matchesCompany && matchesResponsible && matchesChecklist && matchesDate); // Ensure boolean return
    });
  }, [rawInspections, filters]);

  return {
    inspections: filteredInspections,
    loading: isLoading,
    error: queryError ? queryError.message : null, // queryError is Error | null
    fetchInspections: refetchInspections,
    refetchInspections,
    filters,
    setFilters,
    rawInspectionsCount: rawInspections.length
  };
}
