
import { useState, useCallback } from "react";

export function useInspectionSelection() {
  const [selectedInspections, setSelectedInspections] = useState<string[]>([]);
  
  // Select or deselect a single inspection
  const toggleInspectionSelection = useCallback((id: string, selected: boolean) => {
    setSelectedInspections(prev => 
      selected 
        ? [...prev, id] 
        : prev.filter(inspId => inspId !== id)
    );
  }, []);
  
  // Select all inspections from the current page
  const selectAllInspections = useCallback((ids: string[], selected: boolean) => {
    if (selected) {
      setSelectedInspections(prev => {
        // Add only IDs that are not already selected
        const newSelections = ids.filter(id => !prev.includes(id));
        return [...prev, ...newSelections];
      });
    } else {
      // Remove the provided IDs from selection
      setSelectedInspections(prev => prev.filter(id => !ids.includes(id)));
    }
  }, []);
  
  // Select or deselect all inspections (globally)
  const toggleSelectAll = useCallback((allIds: string[], selected: boolean) => {
    if (selected) {
      // Select all inspections
      setSelectedInspections(allIds);
    } else {
      // Deselect all inspections
      setSelectedInspections([]);
    }
  }, []);
  
  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedInspections([]);
  }, []);
  
  return {
    selectedInspections,
    toggleInspectionSelection,
    selectAllInspections,
    toggleSelectAll,
    clearSelection,
    hasSelection: selectedInspections.length > 0
  };
}
