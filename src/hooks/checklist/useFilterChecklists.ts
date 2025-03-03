
import { useState, useMemo } from "react";
import { Checklist, ChecklistFilter } from "@/types/checklist";

export function useFilterChecklists(checklists: Checklist[]) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<ChecklistFilter>("all");

  const filteredChecklists = useMemo(() => {
    return checklists.filter(checklist => {
      // Apply search filter
      const matchesSearch = searchTerm === "" || 
        checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (checklist.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      // Apply type filter
      const matchesType = 
        filterType === "all" ||
        (filterType === "templates" && checklist.is_template) ||
        (filterType === "custom" && !checklist.is_template);

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
