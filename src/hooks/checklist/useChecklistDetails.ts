
import { useState, useEffect } from "react";
import { Checklist, ChecklistItem } from "@/types/checklist";
import { useFetchChecklistData } from "./useFetchChecklistData";
import { useFetchChecklistItems } from "./useFetchChecklistItems";
import { useFetchUsers } from "./useFetchUsers";

export function useChecklistDetails(id: string) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  
  // Fetch the checklist data by ID with proper caching and retry logic
  const { 
    data: checklistData, 
    isLoading, 
    error 
  } = useFetchChecklistData(id);

  // Fetch checklist items with caching
  const { data: itemsData } = useFetchChecklistItems(id, !error);

  // Fetch users for responsible selection
  const users = useFetchUsers();

  // Update checklist when data is loaded - with check to prevent unnecessary updates
  useEffect(() => {
    if (checklistData && (!checklist || checklist.id !== checklistData.id)) {
      console.log("Setting checklist data:", checklistData);
      setChecklist(checklistData as Checklist);
    }
  }, [checklistData, checklist]);

  // Update items when data is loaded - with check to prevent unnecessary updates
  useEffect(() => {
    if (itemsData && JSON.stringify(items) !== JSON.stringify(itemsData)) {
      console.log("Setting items data:", itemsData.length, "items");
      setItems(itemsData as ChecklistItem[]);
    }
  }, [itemsData, items]);

  return {
    checklist,
    setChecklist,
    items,
    setItems,
    users,
    isLoading,
    error
  };
}
