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

  const isValidId = !!id && id !== "create";

  const {
    data: checklistData,
    isLoading,
    error,
    isError
  } = useFetchChecklistData(id, isValidId); // ⚠️ só busca se o ID for válido

  const {
    data: itemsData,
    isError: isItemsError,
    error: itemsError
  } = useFetchChecklistItems(id, isValidId); // ⚠️ idem

  const users = useFetchUsers();

  useEffect(() => {
    console.log(`useChecklistDetails for ID: ${id}, isLoading: ${isLoading}, hasError: ${isError || isItemsError}`);
    if (error || itemsError) {
      console.error("Errors loading data:", { mainError: error, itemsError });
    }

    console.log("Checklist data loaded:", checklistData ? "yes" : "no");
    console.log("Items data loaded:", itemsData ? `yes (${itemsData.length} items)` : "no");
  }, [id, isLoading, isError, isItemsError, error, itemsError, checklistData, itemsData]);

  useEffect(() => {
    if (isValidId && isError && error) {
      console.error("Error loading checklist:", error);
      toast.error("Erro ao carregar checklist", {
        description: "O checklist pode ter sido excluído ou você não tem permissão para acessá-lo."
      });

      const timer = setTimeout(() => {
        navigate("/checklists");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isValidId, isError, error, navigate]);

  useEffect(() => {
    if (checklistData && (!checklist || checklist.id !== checklistData.id)) {
      console.log("Setting checklist data:", checklistData);
      setChecklist(checklistData as Checklist);
    }
  }, [checklistData, checklist]);

  useEffect(() => {
    if (itemsData && itemsData.length > 0) {
      console.log("Setting items data:", itemsData.length, "items");
      setItems(itemsData as ChecklistItem[]);
    } else if (itemsData && itemsData.length === 0 && items.length > 0) {
      console.log("Clearing items as server returned empty array");
      setItems([]);
    }
  }, [itemsData, items.length]);

  return {
    checklist: isValidId ? checklist : null,
    setChecklist,
    items: isValidId ? items : [],
    setItems,
    users,
    isLoading: isValidId ? isLoading : false,
    error: isValidId ? error || itemsError : null,
    isError: isValidId ? isError || isItemsError : false
  };
}
