
import { useState, useEffect } from "react";
import { Checklist, ChecklistFilter } from "@/types/checklist";

export function useFilterChecklists(checklists: Checklist[]) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<ChecklistFilter>("all");
  const [filteredChecklists, setFilteredChecklists] = useState<Checklist[]>(checklists);

  useEffect(() => {
    let result = [...checklists];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (checklist) => 
          checklist.title.toLowerCase().includes(term) || 
          (checklist.description && checklist.description.toLowerCase().includes(term))
      );
    }
    
    // Apply type filter
    if (filterType === "templates") {
      result = result.filter((checklist) => checklist.is_template === true);
    } else if (filterType === "custom") {
      result = result.filter((checklist) => checklist.is_template === false);
    }
    
    setFilteredChecklists(result);
  }, [checklists, searchTerm, filterType]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredChecklists,
  };
}
