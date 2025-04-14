
import { useState, useMemo } from "react";
import { InspectionDetails, InspectionFilters } from "@/types/newChecklist";

export function useInspectionFilters(inspections: InspectionDetails[]) {
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
    filters,
    setFilters,
    filteredInspections
  };
}
