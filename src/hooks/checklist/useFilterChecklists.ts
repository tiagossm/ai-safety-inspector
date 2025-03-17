
import { useState, useMemo } from "react";
import { Checklist } from "@/types/checklist";

export type FilterType = "all" | "active" | "inactive" | "templates" | "my";

export function useFilterChecklists(checklists: Checklist[]) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  
  const filteredChecklists = useMemo(() => {
    console.log("Filtering checklists:", { 
      total: checklists.length,
      searchTerm,
      filterType,
      companyFilter: selectedCompanyId
    });
    
    return checklists.filter(checklist => {
      // Filter by company if a company is selected
      if (selectedCompanyId && checklist.company_id !== selectedCompanyId) {
        return false;
      }
      
      // Filtragem por termo de busca (título, descrição ou categoria)
      const searchMatch = !searchTerm || 
        checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (checklist.category && checklist.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!searchMatch) return false;
      
      // Filtragem por tipo
      switch (filterType) {
        case "active":
          return checklist.status_checklist === "ativo";
        case "inactive":
          return checklist.status_checklist === "inativo";
        case "templates":
          return checklist.is_template;
        case "my":
          // Na implementação real isso deveria verificar o usuário logado
          return true; // Por enquanto mostra todos
        case "all":
        default:
          return true;
      }
    });
  }, [checklists, searchTerm, filterType, selectedCompanyId]);
  
  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    filteredChecklists
  };
}
