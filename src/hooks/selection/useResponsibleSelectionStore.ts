
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { 
  fetchResponsibles, 
  fetchResponsiblesByIds,
  fetchResponsibleById,
  createResponsible,
  ResponsibleSearchResult
} from "@/services/responsible/responsibleSelectionService";

export function useResponsibleSelectionStore(initialSelectedIds: string[] = []) {
  const [selectedResponsibleIds, setSelectedResponsibleIds] = useState<string[]>(initialSelectedIds);
  const queryClient = useQueryClient();

  // Fetch all responsibles
  const {
    data: responsibles = [],
    isLoading: loadingResponsibles,
    error: responsiblesError,
    refetch: refetchResponsibles
  } = useQuery({
    queryKey: ["responsibles"],
    queryFn: () => fetchResponsibles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search responsibles with term
  const searchResponsibles = useCallback(async (term: string) => {
    return fetchResponsibles(term);
  }, []);

  // Fetch selected responsibles details
  const {
    data: selectedResponsibles = [],
    isLoading: loadingSelectedResponsibles
  } = useQuery({
    queryKey: ["responsibles", selectedResponsibleIds],
    queryFn: () => 
      selectedResponsibleIds.length > 0 
        ? fetchResponsiblesByIds(selectedResponsibleIds) 
        : Promise.resolve([]),
    enabled: selectedResponsibleIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recently used responsibles (from local storage)
  const loadRecentlyUsed = useCallback((): ResponsibleSearchResult[] => {
    try {
      const recentUsersString = localStorage.getItem('recentlyUsedResponsibles');
      if (recentUsersString) {
        return JSON.parse(recentUsersString);
      }
    } catch (error) {
      console.error("Error loading recently used responsibles:", error);
    }
    return [];
  }, []);

  // Save to recently used
  const saveToRecentlyUsed = useCallback((user: ResponsibleSearchResult) => {
    try {
      // Get current recent users
      const recentUsers = loadRecentlyUsed();
      
      // Remove the user if it already exists in the list
      const filteredUsers = recentUsers.filter(u => u.id !== user.id);
      
      // Add user to the beginning of the array
      const updatedUsers = [user, ...filteredUsers];
      
      // Limit to 5 recent users
      const limitedUsers = updatedUsers.slice(0, 5);
      
      // Save back to localStorage
      localStorage.setItem('recentlyUsedResponsibles', JSON.stringify(limitedUsers));
      
      return limitedUsers;
    } catch (error) {
      console.error("Error saving to recently used:", error);
      return [];
    }
  }, [loadRecentlyUsed]);

  // Create responsible mutation
  const { 
    mutateAsync: createResponsibleMutation,
    isPending: isCreatingResponsible
  } = useMutation({
    mutationFn: createResponsible,
    onSuccess: (newResponsible) => {
      queryClient.invalidateQueries({ queryKey: ["responsibles"] });
      
      if (newResponsible) {
        setSelectedResponsibleIds(prev => [...prev, newResponsible.id]);
        saveToRecentlyUsed(newResponsible);
      }
    }
  });

  // Toggle responsible selection
  const toggleResponsibleSelection = useCallback((responsible: ResponsibleSearchResult) => {
    setSelectedResponsibleIds(prev => {
      const isSelected = prev.includes(responsible.id);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(id => id !== responsible.id);
      } else {
        // Add to selection
        saveToRecentlyUsed(responsible);
        return [...prev, responsible.id];
      }
    });
  }, [saveToRecentlyUsed]);

  // Remove responsible from selection
  const removeResponsible = useCallback((id: string) => {
    setSelectedResponsibleIds(prev => prev.filter(respId => respId !== id));
  }, []);

  return {
    // Data
    responsibles,
    selectedResponsibles,
    selectedResponsibleIds,
    recentlyUsed: loadRecentlyUsed(),
    
    // Loading states
    loadingResponsibles,
    loadingSelectedResponsibles,
    isCreatingResponsible,
    
    // Errors
    responsiblesError,
    
    // Actions
    setSelectedResponsibleIds,
    toggleResponsibleSelection,
    removeResponsible,
    searchResponsibles,
    createResponsible: createResponsibleMutation,
    refetchResponsibles,
    saveToRecentlyUsed
  };
}
