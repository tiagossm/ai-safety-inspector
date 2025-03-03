
import { useState, useMemo } from "react";
import { Checklist, ChecklistFilter } from "@/types/checklist";

export function useFilterChecklists(checklists: Checklist[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ChecklistFilter>("all");

  const filteredChecklists = useMemo(() => {
    return checklists.filter((checklist) => {
      // Filtrar por texto
      const matchesSearch = 
        !searchTerm || 
        checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrar por tipo
      const matchesType = 
        filterType === "all" || 
        (filterType === "templates" && checklist.isTemplate) || 
        (filterType === "custom" && !checklist.isTemplate);
      
      return matchesSearch && matchesType;
    });
  }, [checklists, searchTerm, filterType]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredChecklists
  };
}
