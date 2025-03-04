
import { useState, useEffect } from "react";
import { Checklist, ChecklistItem } from "@/types/checklist";
import { useFetchChecklistData } from "./useFetchChecklistData";
import { useFetchChecklistItems } from "./useFetchChecklistItems";
import { useFetchUsers } from "./useFetchUsers";
import { useAuth } from "@/components/AuthProvider";

export function useChecklistDetails(id: string) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const { user } = useAuth();
  
  // Fetch the checklist data by ID with proper caching and retry logic
  const { 
    data: checklistData, 
    isLoading, 
    error 
  } = useFetchChecklistData(id);

  // Fetch checklist items with caching
  const { data: itemsData } = useFetchChecklistItems(id, !error);

  // Fetch users for responsible selection - filter by company if needed
  const users = useFetchUsers(user?.company_id);

  // Update checklist when data is loaded - with check to prevent unnecessary updates
  useEffect(() => {
    if (checklistData && (!checklist || checklist.id !== checklistData.id)) {
      console.log("Setting checklist data:", checklistData);
      
      // Ensure company_id is set if not already
      const updatedChecklist = {
        ...checklistData,
        company_id: checklistData.company_id || user?.company_id
      } as Checklist;
      
      setChecklist(updatedChecklist);
    }
  }, [checklistData, checklist, user]);

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
