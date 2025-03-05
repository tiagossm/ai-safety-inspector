
import { useState, useEffect } from "react";
import { Checklist, ChecklistItem } from "@/types/checklist";
import { useFetchChecklistData } from "./useFetchChecklistData";
import { useFetchChecklistItems } from "./useFetchChecklistItems";
import { useFetchUsers } from "./useFetchUsers";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useChecklistDetails(id: string) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const navigate = useNavigate();
  
  // Fetch the checklist data by ID with proper caching and retry logic
  const { 
    data: checklistData, 
    isLoading, 
    error,
    isError 
  } = useFetchChecklistData(id);

  // Fetch checklist items with caching
  const { 
    data: itemsData,
    isError: isItemsError,
    error: itemsError
  } = useFetchChecklistItems(id, !error);

  // Fetch users for responsible selection
  const users = useFetchUsers();

  // Handle checklist not found or errors
  useEffect(() => {
    if (isError && error) {
      console.error("Error loading checklist:", error);
      toast.error("Erro ao carregar checklist", {
        description: "O checklist pode ter sido excluído ou você não tem permissão para acessá-lo."
      });
      
      // Redirect to checklists page after a short delay
      const timer = setTimeout(() => {
        navigate('/checklists');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isError, error, navigate]);

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
    error: error || itemsError,
    isError: isError || isItemsError
  };
}
