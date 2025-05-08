
import { useOptimizedInspections } from "./inspection/useOptimizedInspections";
import { useInspectionFilters } from "./inspection/useInspectionFilters";

export function useInspections() {
  // Utilizamos o hook otimizado para buscar as inspeções
  const { 
    inspections: allInspections, 
    loading, 
    error, 
    fetchInspections, 
    filters, 
    setFilters 
  } = useOptimizedInspections();
  
  // Aplicamos os filtros
  const { filteredInspections } = useInspectionFilters(allInspections);

  return {
    inspections: filteredInspections,
    loading,
    error,
    fetchInspections,
    filters,
    setFilters
  };
}
