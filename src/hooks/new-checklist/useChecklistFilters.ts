
import { useState, useMemo } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { determineChecklistOrigin } from "@/utils/checklist-utils";

export function useChecklistFilters(checklists: ChecklistWithStats[], allChecklists: ChecklistWithStats[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [sortOrder, setSortOrder] = useState("created_desc");

  // Extract unique categories from all checklists
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    allChecklists.forEach((checklist) => {
      if (checklist.category) {
        uniqueCategories.add(checklist.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [allChecklists]);

  // Filter checklists based on search term and origin
  const filteredChecklists = useMemo(() => {
    let filtered = [...checklists];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (checklist) =>
          checklist.title.toLowerCase().includes(search) ||
          (checklist.description && checklist.description.toLowerCase().includes(search)) ||
          (checklist.category && checklist.category.toLowerCase().includes(search))
      );
    }

    // Apply origin filter
    if (selectedOrigin !== "all") {
      filtered = filtered.filter(checklist => {
        const origin = checklist.origin || determineChecklistOrigin(checklist);
        return origin === selectedOrigin;
      });
    }

    return filtered;
  }, [checklists, searchTerm, selectedOrigin]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCategory,
    setSelectedCategory,
    selectedOrigin,
    setSelectedOrigin,
    sortOrder,
    setSortOrder,
    categories,
    filteredChecklists
  };
}
