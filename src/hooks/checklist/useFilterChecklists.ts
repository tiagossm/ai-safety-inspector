
import { useState, useMemo } from "react";
import { Checklist } from "@/types/checklist";
import { CompanyListItem } from "@/types/CompanyListItem";

export function useFilterChecklists(checklists: Checklist[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const filteredChecklists = useMemo(() => {
    return checklists.filter((checklist) => {
      // Filter by search term
      const matchesSearchTerm = checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (checklist.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by type
      let matchesType = true;
      if (filterType === "ativos") {
        matchesType = checklist.status_checklist === "ativo" && !checklist.is_template;
      } else if (filterType === "inativos") {
        matchesType = checklist.status_checklist === "inativo" && !checklist.is_template;
      } else if (filterType === "templates") {
        matchesType = checklist.is_template;
      }

      // Filter by company
      const matchesCompany = !selectedCompanyId || 
        selectedCompanyId === "todos" || 
        checklist.company_id === selectedCompanyId;

      return matchesSearchTerm && matchesType && matchesCompany;
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
