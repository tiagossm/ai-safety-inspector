
import { useInspectionFetcher } from "./inspection/useInspectionFetcher";
import { useInspectionFilters } from "./inspection/useInspectionFilters";

export function useInspections() {
  const { inspections, loading, error, fetchInspections } = useInspectionFetcher();
  const { filters, setFilters, filteredInspections } = useInspectionFilters(inspections);

  return {
    inspections: filteredInspections,
    loading,
    error,
    fetchInspections,
    filters,
    setFilters
  };
}
